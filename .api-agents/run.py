"""Pipeline entry point: run an agent against a spec.

Run from repo root with:
  AGENT=mistral SPEC=helloworld python .api-agents/run.py

Environment variables (both required):
  AGENT  — name of the agent to run
  SPEC   — name of the spec under .sdd/specifications/<name>/spec.md
"""

import importlib.util
import os
import sys
from pathlib import Path


def _load_agents_package() -> None:
    """Register .api-agents as importable under the name 'agents'."""
    if "agents" in sys.modules:
        return
    agents_dir = Path(__file__).resolve().parent
    spec = importlib.util.spec_from_file_location(
        "agents",
        agents_dir / "__init__.py",
        submodule_search_locations=[str(agents_dir)],
    )
    if spec is None or spec.loader is None:
        raise ImportError(f"Could not load .api-agents from {agents_dir}")
    module = importlib.util.module_from_spec(spec)
    sys.modules["agents"] = module
    spec.loader.exec_module(module)


_load_agents_package()
from agents.registry import AGENTS  # noqa: E402


def main() -> None:
    agent_name = os.environ.get("AGENT")
    spec_name = os.environ.get("SPEC")

    if not agent_name:
        raise SystemExit("AGENT env var is required (e.g. AGENT=mistral)")
    if not spec_name:
        raise SystemExit("SPEC env var is required (e.g. SPEC=helloworld)")

    if agent_name not in AGENTS:
        raise SystemExit(f"Unknown agent: {agent_name}. Choices: {list(AGENTS)}")

    spec_path = Path(".sdd/specifications") / spec_name / "spec.md"
    if not spec_path.exists():
        raise SystemExit(f"Spec not found: {spec_path}")

    spec_text = spec_path.read_text()
    print(f"Loaded spec: {spec_path} ({len(spec_text)} chars)")

    agent = AGENTS[agent_name]()
    files = agent.generate(spec_text)

    for path, content in files.items():
        p = Path(path)
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(content)
    print(f"[{agent.name}] wrote {len(files)} files: {list(files)}")


if __name__ == "__main__":
    main()
