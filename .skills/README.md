# Skills

A skill is a **reusable bundle of context** that tells an agent *how* to do a kind of work well, distinct from the spec which tells it *what* to build.

Each skill lives at `.skills/<name>/SKILL.md` and follows the [Anthropic Skills](https://www.anthropic.com/news/skills) convention:

- YAML frontmatter with `name` and `description`
- Markdown body with the actual guidance

```
.skills/
└── vinyl-traffic-ui/
    └── SKILL.md
```

## How agents pick up skills

Workflow agents consume `.skills/` automatically — no per-spec configuration needed. The `sdd/agents/<agent>/run-*.sh` entrypoint prompts include an instruction to read every `.skills/<name>/SKILL.md` before generating code, and `.skills/` is read-only for agents, like most of `sdd/` (see [AGENTS.md](../AGENTS.md#provenance-and-scenarios) for which `sdd/` paths agents may write, depending on `AGENT_ROLE`).

## Adding a new skill

1. Create `.skills/<name>/SKILL.md` with valid YAML frontmatter (`name`, `description`) and a markdown body.
2. That's it — workflow agents pick it up on the next run.

Skills should be **task-shaped**, not project-specific lore. This repo includes **`vinyl-traffic-ui`** (how to implement the Vinyl Traffic plain-CSS UI) alongside context docs; "how this repo's one-off feature acceptance criteria work" is not a skill — that belongs in the spec.

## Conventions

- Treat `.skills/` as read-only from an agent's perspective — like most of `sdd/`, it's an input (see [AGENTS.md](../AGENTS.md#provenance-and-scenarios) for allowed `sdd/` agent outputs by role).
- Keep each skill focused and short. The whole `SKILL.md` is loaded into context every run; bloat costs tokens on every invocation.
- The skill `name` in the frontmatter should match the directory name.
- Prefer skills that stay useful across specs in this repo; project-specific skills are OK when they encode non-obvious product craft (this repo's UI skill is an example).
