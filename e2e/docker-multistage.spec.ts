import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';

/**
 * Test suite for sdd/specs/docker-multistage/spec.md
 *
 * Static checks run everywhere. Runtime checks need Docker CLI (and, in agent
 * containers, `/var/run/docker.sock` mounted with matching `--group-add` for
 * non-root users — see `sdd/scripts/run-agent-local.sh` and
 * `.forgejo/workflows/workflow-agents.yml`).
 */

const REPO_ROOT = join(__dirname, '..');

test.describe('Docker multistage configuration', () => {
  test('Dockerfile exists at repository root', () => {
    const dockerfilePath = join(REPO_ROOT, 'Dockerfile');
    expect(existsSync(dockerfilePath)).toBe(true);
  });

  test('Dockerfile has multistage build with build and runtime stages', () => {
    const dockerfile = readFileSync(join(REPO_ROOT, 'Dockerfile'), 'utf-8');

    // Check for at least two FROM instructions
    const fromMatches = dockerfile.match(/^FROM /gm);
    expect(fromMatches).toBeTruthy();
    expect(fromMatches!.length).toBeGreaterThanOrEqual(2);

    // Check for named build stage
    expect(dockerfile).toMatch(/FROM\s+node:[\d.]+-alpine\s+AS\s+build/i);

    // Check for nginx runtime stage
    expect(dockerfile).toMatch(/FROM\s+nginx:alpine/i);
  });

  test('Build stage uses Node 20 Alpine', () => {
    const dockerfile = readFileSync(join(REPO_ROOT, 'Dockerfile'), 'utf-8');
    expect(dockerfile).toMatch(/FROM\s+node:20-alpine/);
  });

  test('Build stage sets WORKDIR', () => {
    const dockerfile = readFileSync(join(REPO_ROOT, 'Dockerfile'), 'utf-8');
    expect(dockerfile).toContain('WORKDIR');
  });

  test('Build stage uses corepack with exact pnpm version from package.json', () => {
    const dockerfile = readFileSync(join(REPO_ROOT, 'Dockerfile'), 'utf-8');
    const packageJson = JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf-8'));

    expect(dockerfile).toContain('corepack enable');
    expect(dockerfile).toContain('corepack prepare');

    // Extract pnpm version from packageManager field
    const packageManager = packageJson.packageManager;
    expect(packageManager).toMatch(/^pnpm@/);
    const pnpmVersion = packageManager.split('@')[1];

    // Verify Dockerfile uses the exact same version
    expect(dockerfile).toContain(`pnpm@${pnpmVersion}`);
  });

  test('Build stage copies package files before source for layer caching', () => {
    const dockerfile = readFileSync(join(REPO_ROOT, 'Dockerfile'), 'utf-8');
    const lines = dockerfile.split('\n');

    // Find positions of key instructions
    let packageCopyLine = -1;
    let pnpmInstallLine = -1;
    let fullCopyLine = -1;
    let pnpmBuildLine = -1;

    lines.forEach((line, idx) => {
      if (line.includes('COPY package.json pnpm-lock.yaml')) packageCopyLine = idx;
      if (line.includes('pnpm install --frozen-lockfile')) pnpmInstallLine = idx;
      if (line.match(/COPY \. \./)) fullCopyLine = idx;
      if (line.includes('pnpm build')) pnpmBuildLine = idx;
    });

    // Verify ordering for optimal layer caching
    expect(packageCopyLine).toBeGreaterThan(-1);
    expect(pnpmInstallLine).toBeGreaterThan(packageCopyLine);
    expect(fullCopyLine).toBeGreaterThan(pnpmInstallLine);
    expect(pnpmBuildLine).toBeGreaterThan(fullCopyLine);
  });

  test('Build stage uses --frozen-lockfile flag', () => {
    const dockerfile = readFileSync(join(REPO_ROOT, 'Dockerfile'), 'utf-8');
    expect(dockerfile).toContain('pnpm install --frozen-lockfile');
  });

  test('Runtime stage copies built dist from build stage', () => {
    const dockerfile = readFileSync(join(REPO_ROOT, 'Dockerfile'), 'utf-8');
    expect(dockerfile).toMatch(/COPY --from=build \/app\/dist \/usr\/share\/nginx\/html/);
  });

  test('Runtime stage copies nginx.conf', () => {
    const dockerfile = readFileSync(join(REPO_ROOT, 'Dockerfile'), 'utf-8');
    expect(dockerfile).toMatch(/COPY nginx\.conf \/etc\/nginx\/conf\.d\/default\.conf/);
  });

  test('Runtime stage exposes port 8080', () => {
    const dockerfile = readFileSync(join(REPO_ROOT, 'Dockerfile'), 'utf-8');
    expect(dockerfile).toMatch(/EXPOSE 8080/);
  });

  test('Runtime stage starts nginx with daemon off', () => {
    const dockerfile = readFileSync(join(REPO_ROOT, 'Dockerfile'), 'utf-8');
    expect(dockerfile).toMatch(/CMD.*nginx.*daemon off/);
  });

  test('nginx.conf exists at repository root', () => {
    const nginxConfPath = join(REPO_ROOT, 'nginx.conf');
    expect(existsSync(nginxConfPath)).toBe(true);
  });

  test('nginx.conf listens on port 8080', () => {
    const nginxConf = readFileSync(join(REPO_ROOT, 'nginx.conf'), 'utf-8');
    expect(nginxConf).toMatch(/listen\s+8080/);
  });

  test('.dockerignore exists at repository root', () => {
    const dockerignorePath = join(REPO_ROOT, '.dockerignore');
    expect(existsSync(dockerignorePath)).toBe(true);
  });

  test('.dockerignore excludes required patterns', () => {
    const dockerignore = readFileSync(join(REPO_ROOT, '.dockerignore'), 'utf-8');

    // Required exclusions per spec
    const requiredPatterns = [
      '.git',
      'node_modules',
      'dist',
      '.env',
      '.tmp',
      'playwright-report',
      'test-results',
      'coverage'
    ];

    requiredPatterns.forEach(pattern => {
      expect(dockerignore).toContain(pattern);
    });
  });

  test('Dockerfile does not copy .env files', () => {
    const dockerfile = readFileSync(join(REPO_ROOT, 'Dockerfile'), 'utf-8');
    // Should not have explicit COPY .env commands
    expect(dockerfile).not.toMatch(/COPY\s+\.env/);
  });
});

test.describe.serial('Docker build and runtime verification', () => {
  test.describe.configure({ timeout: 360_000 });

  const imageTag = `docker-multistage-e2e:${randomBytes(8).toString('hex')}`;
  let containerName = '';

  test.afterAll(() => {
    if (containerName) {
      try {
        execSync(`docker rm -f ${containerName}`, { stdio: 'ignore' });
      } catch {
        /* ignore */
      }
    }
    try {
      execSync(`docker rmi -f ${imageTag}`, { stdio: 'ignore' });
    } catch {
      /* ignore */
    }
  });

  test('docker build succeeds', () => {
    execSync(`docker build -t ${imageTag} .`, {
      cwd: REPO_ROOT,
      stdio: 'inherit',
      env: { ...process.env, DOCKER_BUILDKIT: '1' },
    });
  });

  test('docker history shows multistage layers', () => {
    const history = execSync(`docker history --no-trunc ${imageTag}`, {
      encoding: 'utf-8',
    });
    expect(history).toMatch(/--from=\s*build|from build|\/app\/dist/i);
  });

  test('running container serves HTTP 200 on port 8080', () => {
    containerName = `e2e-ngx-${randomBytes(6).toString('hex')}`;
    execSync(`docker run -d --name ${containerName} ${imageTag}`, {
      encoding: 'utf-8',
    });
    const innerProbe =
      '(wget -qO- http://127.0.0.1:8080/ >/dev/null 2>&1) || ' +
      '(command -v curl >/dev/null 2>&1 && curl -fsS http://127.0.0.1:8080/ >/dev/null) || ' +
      '(apk add --no-cache --quiet curl && curl -fsS http://127.0.0.1:8080/ >/dev/null)';
    execSync(`docker exec ${containerName} sh -c ${JSON.stringify(innerProbe)}`, {
      encoding: 'utf-8',
      stdio: 'pipe',
      timeout: 120_000,
    });
  });

  test('final image has no Node.js runtime', () => {
    expect(() =>
      execSync(`docker run --rm ${imageTag} sh -c 'command -v node'`, {
        stdio: 'pipe',
      }),
    ).toThrow();
  });
});
