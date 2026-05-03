"""Mistral Codestral agent."""

import json
import os

import requests

from .base import Agent
from .skills import load_skills


class MistralAgent(Agent):
    name = "mistral"

    def generate(self, spec: str) -> dict[str, str]:
        skills = load_skills()
        system = f"{self.system_prompt}\n\n{skills}" if skills else self.system_prompt
        resp = requests.post(
            "https://api.mistral.ai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {os.environ['MISTRAL_API_KEY']}",
                "Content-Type": "application/json",
            },
            json={
                "model": "codestral-latest",
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": f"SPEC:\n\n{spec}"},
                ],
                "response_format": {"type": "json_object"},
                "temperature": 0.2,
            },
            timeout=120,
        )
        resp.raise_for_status()
        return json.loads(resp.json()["choices"][0]["message"]["content"])
