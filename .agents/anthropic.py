"""Anthropic Claude agent."""

import json
import os
import re

import requests

from .base import Agent


def _extract_json(text: str) -> str:
    """Strip markdown fences and locate the JSON object even if Claude adds prose."""
    text = text.strip()

    # Strip ```json ... ``` or ``` ... ``` fences
    fence = re.match(r"^```(?:json)?\s*\n?(.*?)\n?```$", text, re.DOTALL)
    if fence:
        text = fence.group(1).strip()

    # Find the outermost { ... } if there's leading or trailing prose
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        return text[start : end + 1]
    return text


class AnthropicAgent(Agent):
    name = "anthropic"
    system_prompt = Agent.system_prompt + " Begin your response with { and end with }."

    def generate(self, spec: str) -> dict[str, str]:
        resp = requests.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": os.environ["ANTHROPIC_API_KEY"],
                "anthropic-version": "2023-06-01",
                "Content-Type": "application/json",
            },
            json={
                "model": "claude-sonnet-4-5",
                "max_tokens": 8192,
                "system": self.system_prompt,
                "messages": [{"role": "user", "content": f"SPEC:\n\n{spec}"}],
            },
            timeout=120,
        )
        resp.raise_for_status()
        raw = resp.json()["content"][0]["text"]
        return json.loads(_extract_json(raw))
