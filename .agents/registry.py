"""Agent registry. New agents are added here."""

from .anthropic import AnthropicAgent
from .mistral import MistralAgent

AGENTS = {
    "anthropic": AnthropicAgent,
    "mistral": MistralAgent,
}
