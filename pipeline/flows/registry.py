"""The node registry.

Every node type is a class registered here. The editor gets its palette and
property forms from `registry.to_json()`, so adding a node type in Python makes
it appear in the UI with no JavaScript changes.

A node's `execute()` returns the number of the output to follow (1-based, the
same convention FileFlows uses). Two numbers are special:

    0   stop here, the flow finished normally
   -1   stop here, the flow failed
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .engine import FlowContext


@dataclass
class Output:
    """One connection point on the bottom of a node."""

    label: str
    tone: str = "neutral"  # neutral | yes | no — drives the port colour


@dataclass
class Field:
    """One row in the node's properties panel."""

    name: str
    label: str
    type: str = "text"  # text | number | select | checkbox | textarea | csv
    default: object = ""
    choices: list = field(default_factory=list)  # [(value, label), ...]
    help: str = ""
    placeholder: str = ""

    def to_json(self) -> dict:
        return {
            "name": self.name,
            "label": self.label,
            "type": self.type,
            "default": self.default,
            "choices": [{"value": v, "label": l} for v, l in self.choices],
            "help": self.help,
            "placeholder": self.placeholder,
        }


class Node:
    """Base class for every node type."""

    type: str = ""
    label: str = ""
    category: str = "logic"  # input | logic | action | flow
    description: str = ""
    icon: str = "dot"
    outputs: list[Output] = [Output("Next")]
    fields: list[Field] = []
    # Set on nodes that modify the file. The dry run uses this to decide
    # whether a file "needs work" without doing any of it.
    mutating: bool = False

    def execute(self, ctx: "FlowContext", config: dict) -> int:
        raise NotImplementedError

    def summary(self, config: dict) -> str:
        """One line shown on the node body in the editor."""
        return ""

    # -- helpers -----------------------------------------------------------
    @staticmethod
    def _int(config: dict, key: str, default: int = 0) -> int:
        try:
            return int(config.get(key) or default)
        except (TypeError, ValueError):
            return default

    @staticmethod
    def _list(config: dict, key: str) -> list[str]:
        raw = config.get(key) or ""
        if isinstance(raw, list):
            return [str(v).strip().lower() for v in raw if str(v).strip()]
        return [v.strip().lower() for v in str(raw).split(",") if v.strip()]

    def to_json(self) -> dict:
        return {
            "type": self.type,
            "label": self.label,
            "category": self.category,
            "description": self.description,
            "icon": self.icon,
            "mutating": self.mutating,
            "outputs": [{"label": o.label, "tone": o.tone} for o in self.outputs],
            "fields": [f.to_json() for f in self.fields],
        }

    def defaults(self) -> dict:
        return {f.name: f.default for f in self.fields}


class Condition(Node):
    """A node with Yes/No outputs. Subclasses implement `test()`."""

    category = "logic"
    outputs = [Output("Yes", "yes"), Output("No", "no")]

    def test(self, ctx: "FlowContext", config: dict) -> bool:
        raise NotImplementedError

    def execute(self, ctx: "FlowContext", config: dict) -> int:
        return 1 if self.test(ctx, config) else 2


class Registry:
    def __init__(self):
        self._nodes: dict[str, Node] = {}

    def register(self, cls: type[Node]) -> type[Node]:
        if not cls.type:
            raise ValueError(f"{cls.__name__} needs a `type`")
        self._nodes[cls.type] = cls()
        return cls

    def get(self, type_name: str) -> Node | None:
        return self._nodes.get(type_name)

    def all(self) -> list[Node]:
        order = {"input": 0, "logic": 1, "action": 2, "flow": 3}
        return sorted(self._nodes.values(), key=lambda n: (order.get(n.category, 9), n.label))

    def to_json(self) -> list[dict]:
        return [node.to_json() for node in self.all()]


registry = Registry()
register = registry.register
