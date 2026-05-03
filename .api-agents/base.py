"""Base class for SDD agents.

An agent reads a spec and produces a mapping of file paths to file contents.
"""

from abc import ABC, abstractmethod


class Agent(ABC):
    name: str
    system_prompt: str = (
        "You are a Builder Agent. Read the spec and output ONLY a JSON object "
        "mapping repo-relative file paths to file contents. No prose, no code fences. "
        'Example: {"Dockerfile": "FROM nginx:alpine\\n...", "app/index.html": "..."}'
    )

    @abstractmethod
    def generate(self, spec: str) -> dict[str, str]:
        """Return a mapping of repo-relative path to file content."""
