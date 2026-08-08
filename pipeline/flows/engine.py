"""Walks a saved graph, node by node.

The same engine runs twice per file, in two modes:

  dry run   during probing. Conditions evaluate normally; actions record what
            they would do and set `needs_work`. Cheap, so the UI can show a
            verdict without an hour of encoding.

  live      in the transcode worker. Actions really run.

Both produce a `trace` — the ordered list of nodes visited and the output taken
at each one. The editor replays it to highlight the path a file took.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

from . import nodes as _nodes  # noqa: F401  — importing registers every node type
from .registry import registry

MAX_STEPS = 250


@dataclass
class EncodeSettings:
    """Duck-types TranscodeProfile so ffmpeg.build_command works unchanged."""

    video_codec: str = "hevc"
    container: str = "mkv"
    audio_codec: str = "copy"
    quality: int = 24
    preset: str = "medium"
    hw_accel: str = "none"
    max_height: int | None = None
    extra_args: str = ""


@dataclass
class FlowContext:
    """Everything a node can read or change during one run."""

    working_path: str
    relative_path: str
    metadata: dict = field(default_factory=dict)
    variables: dict = field(default_factory=dict)
    dry_run: bool = True
    run_id: int = 0

    # Filled in as the flow runs
    messages: list = field(default_factory=list)
    planned: list = field(default_factory=list)
    trace: list = field(default_factory=list)
    verdict_reason: str = ""
    size_before: int = 0
    size_after: int = 0
    changed: bool = False
    needs_work: bool = False

    # Injected by the worker so action nodes can report progress and be stopped
    progress_callback: object = None
    cancel_callback: object = None
    command_callback: object = None

    def log(self, message: str) -> None:
        for name, value in self.variables.items():
            message = message.replace("{" + name + "}", str(value))
        self.messages.append(message)

    def plan(self, description: str) -> None:
        """Called by an action during a dry run instead of doing the work."""
        self.planned.append(description)
        self.needs_work = True

    def encode_settings(self, config: dict) -> EncodeSettings:
        max_height = config.get("max_height") or 0
        try:
            max_height = int(max_height)
        except (TypeError, ValueError):
            max_height = 0
        try:
            quality = int(config.get("quality") or 24)
        except (TypeError, ValueError):
            quality = 24
        return EncodeSettings(
            video_codec=config.get("video_codec") or "hevc",
            container=config.get("container") or "mkv",
            audio_codec=config.get("audio_codec") or "copy",
            quality=quality,
            preset=config.get("preset") or "medium",
            hw_accel=config.get("hw_accel") or "none",
            max_height=max_height or None,
            extra_args=config.get("extra_args") or "",
        )

    def replace_working_file(self, path: Path, before: int = 0, after: int = 0) -> None:
        self.working_path = str(path)
        self.changed = True
        if before:
            self.size_before = self.size_before or before
        if after:
            self.size_after = after
        self.metadata["size_bytes"] = after or self.metadata.get("size_bytes")

    def on_progress(self, progress) -> None:
        if self.progress_callback:
            self.progress_callback(progress)

    def should_cancel(self) -> bool:
        return bool(self.cancel_callback and self.cancel_callback())

    def record_command(self, command: list[str]) -> None:
        if self.command_callback:
            self.command_callback(command)


@dataclass
class FlowResult:
    completed: bool
    failed: bool
    ctx: FlowContext

    @property
    def trace(self) -> list:
        return self.ctx.trace

    @property
    def needs_work(self) -> bool:
        return self.ctx.needs_work

    @property
    def reason(self) -> str:
        # In a dry run the terminal node's reason describes the state *after*
        # the work ("Transcoded by flow"), which is a lie about a file that
        # hasn't been touched yet. What it would do is the useful answer.
        if self.ctx.planned:
            return self.ctx.planned[0]
        if self.ctx.verdict_reason:
            return self.ctx.verdict_reason
        return "Flow finished"


class FlowError(RuntimeError):
    pass


def validate(graph: dict) -> list[str]:
    """Problems worth showing the person before they hit save."""
    problems: list[str] = []
    nodes = graph.get("nodes") or []
    edges = graph.get("edges") or []

    inputs = [n for n in nodes if n.get("type") == "input_file"]
    if not inputs:
        problems.append("No input node. Add one so the flow knows where to start.")
    elif len(inputs) > 1:
        problems.append("More than one input node. A flow can only start in one place.")

    known = {n["id"] for n in nodes}
    for node in nodes:
        definition = registry.get(node.get("type", ""))
        if definition is None:
            problems.append(f"Unknown node type: {node.get('type')}")
            continue
        wired = {e["output"] for e in edges if e["from"] == node["id"]}
        for index, output in enumerate(definition.outputs, start=1):
            if index not in wired:
                problems.append(f"{definition.label}: the “{output.label}” output goes nowhere.")

    for edge in edges:
        if edge.get("from") not in known or edge.get("to") not in known:
            problems.append("A connection points at a node that no longer exists.")

    reachable = _reachable(graph)
    for node in nodes:
        if node["id"] not in reachable:
            definition = registry.get(node.get("type", ""))
            problems.append(f"{definition.label if definition else node['type']} is not connected.")

    return problems


def _reachable(graph: dict) -> set[str]:
    edges = graph.get("edges") or []
    start = next((n["id"] for n in graph.get("nodes", []) if n.get("type") == "input_file"), None)
    if start is None:
        return set()
    seen, stack = {start}, [start]
    while stack:
        current = stack.pop()
        for edge in edges:
            if edge["from"] == current and edge["to"] not in seen:
                seen.add(edge["to"])
                stack.append(edge["to"])
    return seen


def run(graph: dict, ctx: FlowContext) -> FlowResult:
    nodes = {n["id"]: n for n in graph.get("nodes") or []}
    routes = {(e["from"], e["output"]): e["to"] for e in graph.get("edges") or []}

    current_id = next((n["id"] for n in nodes.values() if n.get("type") == "input_file"), None)
    if current_id is None:
        raise FlowError("This flow has no input node.")

    steps = 0
    failed = False

    while current_id:
        steps += 1
        if steps > MAX_STEPS:
            # A loop, or a graph big enough that something is wrong.
            ctx.log(f"Stopped after {MAX_STEPS} steps — check the flow for a loop.")
            failed = True
            break

        node = nodes.get(current_id)
        if node is None:
            ctx.log("A connection points at a node that no longer exists.")
            failed = True
            break

        definition = registry.get(node.get("type", ""))
        if definition is None:
            ctx.log(f"Unknown node type “{node.get('type')}”, stopping.")
            failed = True
            break

        config = {**definition.defaults(), **(node.get("config") or {})}
        try:
            output = definition.execute(ctx, config)
        except Exception as exc:  # a bad regex or a dead encoder shouldn't be silent
            ctx.log(f"{definition.label} raised {type(exc).__name__}: {exc}")
            ctx.trace.append(_step(node, definition, -1, "error"))
            raise

        label = ""
        if 1 <= output <= len(definition.outputs):
            label = definition.outputs[output - 1].label
        ctx.trace.append(_step(node, definition, output, label))

        if output == -1:
            failed = True
            break
        if output == 0:
            break

        current_id = routes.get((current_id, output))
        if current_id is None:
            # An unwired output is a normal way to end a branch.
            break

    return FlowResult(completed=not failed, failed=failed, ctx=ctx)


def _step(node: dict, definition, output: int, label: str) -> dict:
    return {
        "node": node["id"],
        "type": node.get("type"),
        "label": definition.label,
        "output": output,
        "output_label": label,
    }


def default_graph() -> dict:
    """The starting point for a new flow.

    Fully wired on purpose: a new flow should open without warnings, and it
    doubles as a worked example of the branch-and-terminate shape.
    """
    return {
        "nodes": [
            {"id": "n1", "type": "input_file", "x": 400, "y": 40, "config": {}},
            {"id": "n2", "type": "video_codec_is", "x": 400, "y": 180,
             "config": {"codecs": "hevc"}},
            {"id": "n3", "type": "complete_flow", "x": 120, "y": 380,
             "config": {"reason": "Already HEVC"}},
            {"id": "n4", "type": "transcode_video", "x": 560, "y": 360,
             "config": {"video_codec": "hevc", "container": "mkv", "quality": 24,
                        "preset": "medium", "audio_codec": "copy", "hw_accel": "none",
                        "max_height": 0, "extra_args": ""}},
            {"id": "n5", "type": "complete_flow", "x": 440, "y": 620,
             "config": {"reason": "Transcoded to HEVC"}},
            {"id": "n6", "type": "complete_flow", "x": 740, "y": 620,
             "config": {"reason": "Re-encode came out larger, kept the original"}},
        ],
        "edges": [
            {"from": "n1", "output": 1, "to": "n2"},
            {"from": "n2", "output": 1, "to": "n3"},
            {"from": "n2", "output": 2, "to": "n4"},
            {"from": "n4", "output": 1, "to": "n5"},
            {"from": "n4", "output": 2, "to": "n6"},
        ],
    }
