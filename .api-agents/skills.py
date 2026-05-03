"""Load `.skills/<name>/SKILL.md` files for inclusion in agent prompts.

Skills express *how* to do a kind of work well (e.g. visual design quality)
and are distinct from specs, which express *what* to build. Each agent
appends the loaded skills text to its system prompt at call time.

The path is resolved relative to the repo root (the parent of `.api-agents/`)
rather than `Path.cwd()`, so the loader works regardless of where the runner
is invoked from.
"""

from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SKILLS_DIR = REPO_ROOT / ".skills"


def load_skills() -> str:
    """Concatenate every `.skills/*/SKILL.md` into a single prompt block.

    Returns an empty string if `.skills/` does not exist or contains no
    `SKILL.md` files. The first call prints a one-line inventory so the
    runner output makes it visible which skills are active for a given run.
    """
    if not SKILLS_DIR.exists():
        return ""

    skill_files = sorted(SKILLS_DIR.glob("*/SKILL.md"))
    if not skill_files:
        return ""

    names = [p.parent.name for p in skill_files]
    print(f"Loaded skills: {names}")

    parts = [f"# Skill: {p.parent.name}\n\n{p.read_text()}" for p in skill_files]
    header = (
        "SKILLS — apply the following guidelines where relevant to the spec. "
        "Skills describe how to do work well; they do not change what the "
        "spec asks for."
    )
    return f"{header}\n\n" + "\n\n---\n\n".join(parts)
