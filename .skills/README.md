# Skills

A skill is a **reusable bundle of context** that tells an agent *how* to do a kind of work well, distinct from the spec which tells it *what* to build.

Each skill lives at `.skills/<name>/SKILL.md` and follows the [Anthropic Skills](https://www.anthropic.com/news/skills) convention:

- YAML frontmatter with `name` and `description`
- Markdown body with the actual guidance

```
.skills/
└── frontend-design/
    └── SKILL.md
```

## How agents pick up skills

Both agent tracks consume `.skills/` automatically — no per-spec configuration needed.

**API agents** (`.api-agents/`)
[`.api-agents/skills.py`](../.api-agents/skills.py) globs every `.skills/*/SKILL.md` and the agents append the concatenated text to their **system prompt** at call time. Skills land in the system prompt because they describe how to work, not what to build; the spec stays in the user message.

**Container agents** (`.container-agents/`)
The `run-*.sh` entrypoint prompts include an instruction to read every `.skills/<name>/SKILL.md` before generating code, and `.skills/` is added to the read-only list alongside `.sdd/`.

## Adding a new skill

1. Create `.skills/<name>/SKILL.md` with valid YAML frontmatter (`name`, `description`) and a markdown body.
2. That's it — both agent tracks pick it up on the next run.

Skills should be **task-shaped**, not project-specific lore. `frontend-design` (how to make a UI good) is a skill; "how the helloworld spec works" is not — that belongs in the spec.

## Conventions

- Treat `.skills/` as read-only from an agent's perspective — like `.sdd/`, it's an input.
- Keep each skill focused and short. The whole `SKILL.md` is loaded into context every run; bloat costs tokens on every invocation.
- The skill `name` in the frontmatter should match the directory name.
- Skills are domain-agnostic — the same skill should be usable across multiple specs in this repo or others.
