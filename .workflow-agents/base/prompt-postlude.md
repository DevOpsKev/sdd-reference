Hard constraints:
- Do not modify anything under .sdd/, .skills/, .context/, .scripts/,
  .workflow-agents/, .forgejo/, or .husky/. Those are inputs and
  infrastructure, not agent output.
- Do not run any git commands. Do not commit, push, fetch, or modify
  remotes. The surrounding CI workflow handles all version control.
- When the acceptance criteria appear satisfied, stop. Do not keep
  exploring or refactoring beyond what the spec asks for.
