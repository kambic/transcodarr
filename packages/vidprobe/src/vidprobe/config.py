"""Configuration file loading.

Config resolution order (first hit wins unless --config is given):
    $VIDPROBE_CONFIG
    ./vidprobe.toml
    ./.vidprobe.toml
    $XDG_CONFIG_HOME/vidprobe/config.toml  (or ~/.config/vidprobe/config.toml)
    /etc/vidprobe/config.toml
"""

from __future__ import annotations

import json
import os
import shutil
import tomllib
from dataclasses import dataclass, field
from pathlib import Path

CONFIG_ENV = "VIDPROBE_CONFIG"
CONFIG_NAME = "config.toml"


class ConfigError(RuntimeError):
    """Raised when a config file exists but cannot be used."""


# --------------------------------------------------------------------------- #
# language handling
# --------------------------------------------------------------------------- #
# canonical ISO 639-2/T code -> every alias we accept for it
LANGUAGE_ALIASES: dict[str, tuple[str, ...]] = {
    "eng": ("en", "eng", "english"),
    "slv": ("sl", "slv", "slovenian", "slovene"),
    "hrv": ("hr", "hrv", "scr", "croatian"),
    "srp": ("sr", "srp", "scc", "serbian"),
    "bos": ("bs", "bos", "bosnian"),
    "deu": ("de", "deu", "ger", "german"),
    "fra": ("fr", "fra", "fre", "french"),
    "spa": ("es", "spa", "castilian", "spanish"),
    "ita": ("it", "ita", "italian"),
    "por": ("pt", "por", "portuguese"),
    "nld": ("nl", "nld", "dut", "dutch"),
    "pol": ("pl", "pol", "polish"),
    "ces": ("cs", "ces", "cze", "czech"),
    "slk": ("sk", "slk", "slo", "slovak"),
    "hun": ("hu", "hun", "hungarian"),
    "ron": ("ro", "ron", "rum", "romanian"),
    "bul": ("bg", "bul", "bulgarian"),
    "ell": ("el", "ell", "gre", "greek"),
    "rus": ("ru", "rus", "russian"),
    "ukr": ("uk", "ukr", "ukrainian"),
    "tur": ("tr", "tur", "turkish"),
    "ara": ("ar", "ara", "arabic"),
    "heb": ("he", "heb", "iw", "hebrew"),
    "hin": ("hi", "hin", "hindi"),
    "jpn": ("ja", "jpn", "japanese"),
    "kor": ("ko", "kor", "korean"),
    "zho": ("zh", "zho", "chi", "chinese", "cmn", "yue"),
    "tha": ("th", "tha", "thai"),
    "vie": ("vi", "vie", "vietnamese"),
    "ind": ("id", "ind", "indonesian"),
    "swe": ("sv", "swe", "swedish"),
    "nor": ("no", "nor", "nob", "nno", "norwegian"),
    "dan": ("da", "dan", "danish"),
    "fin": ("fi", "fin", "finnish"),
    "isl": ("is", "isl", "ice", "icelandic"),
    "sqi": ("sq", "sqi", "alb", "albanian"),
    "mkd": ("mk", "mkd", "mac", "macedonian"),
    "est": ("et", "est", "estonian"),
    "lav": ("lv", "lav", "latvian"),
    "lit": ("lt", "lit", "lithuanian"),
}

_ALIAS_INDEX: dict[str, str] = {
    alias: canonical
    for canonical, aliases in LANGUAGE_ALIASES.items()
    for alias in aliases
}

UNDETERMINED = {"und", "unknown", "", "none", "zxx", "mis", "mul"}


def normalize_language(code: str | None) -> str:
    """Fold any language spelling onto a canonical 3-letter code.

    Unknown codes are lowercased and returned as-is so custom tags still work.
    """
    if not code:
        return "und"
    token = code.strip().lower().replace("_", "-")
    token = token.split("-")[0]  # 'en-US' -> 'en', 'pt-BR' -> 'pt'
    if token in UNDETERMINED:
        return "und"
    return _ALIAS_INDEX.get(token, token)


def language_matches(stream_lang: str | None, wanted: list[str]) -> bool:
    normalized = normalize_language(stream_lang)
    return normalized in {normalize_language(w) for w in wanted}


# --------------------------------------------------------------------------- #
# dataclasses
# --------------------------------------------------------------------------- #
@dataclass
class Build:
    """One FFmpeg installation - lets you A/B a stock build against an optimized one."""

    name: str
    ffmpeg: str = "ffmpeg"
    ffprobe: str = "ffprobe"
    label: str = ""
    extra_args: list[str] = field(default_factory=list)
    env: dict[str, str] = field(default_factory=dict)
    note: str = ""

    @property
    def display(self) -> str:
        return self.label or self.name

    def resolve(self, which: str = "ffmpeg") -> str | None:
        """Absolute path to the binary, or None if it is not usable."""
        candidate = self.ffmpeg if which == "ffmpeg" else self.ffprobe
        expanded = os.path.expanduser(os.path.expandvars(candidate))
        if os.path.sep in expanded:
            path = Path(expanded)
            return str(path) if path.is_file() and os.access(path, os.X_OK) else None
        return shutil.which(expanded)

    @property
    def available(self) -> bool:
        return bool(self.resolve("ffmpeg") and self.resolve("ffprobe"))


@dataclass
class LanguagePolicy:
    preferred: list[str] = field(default_factory=lambda: ["eng"])
    keep_undetermined: bool = True
    keep_default_stream: bool = True
    fallback_keep_first: bool = True
    apply_to: list[str] = field(default_factory=lambda: ["audio", "subtitle"])

    def wants(self, code: str | None) -> bool:
        if language_matches(code, self.preferred):
            return True
        return self.keep_undetermined and normalize_language(code) == "und"

    def rank(self, code: str | None) -> int:
        """Position in the preference list; large number means not preferred."""
        normalized = normalize_language(code)
        for i, wanted in enumerate(self.preferred):
            if normalize_language(wanted) == normalized:
                return i
        return len(self.preferred) + 1


@dataclass
class ThumbnailDefaults:
    width: int = 320
    interval: float = 10.0
    count: int = 12
    scene_threshold: float = 0.35
    quality: int = 3
    format: str = "jpg"
    sprite_columns: int = 5
    sprite_rows: int = 5


@dataclass
class CutDefaults:
    duration: float = 60.0
    accurate: bool = False
    fade: float = 0.0


@dataclass
class Config:
    path: Path | None = None
    builds: dict[str, Build] = field(default_factory=dict)
    default_build: str = "system"
    languages: LanguagePolicy = field(default_factory=LanguagePolicy)
    thumbnails: ThumbnailDefaults = field(default_factory=ThumbnailDefaults)
    cut: CutDefaults = field(default_factory=CutDefaults)
    timeout: float = 20.0
    analyze: float = 5.0
    output_dir: str | None = None
    overwrite: bool = False

    def build(self, name: str | None = None) -> Build:
        key = name or self.default_build
        if key in self.builds:
            return self.builds[key]
        if name:
            known = ", ".join(self.builds) or "none configured"
            raise ConfigError(f"unknown ffmpeg build '{name}' (available: {known})")
        return Build(name="system")

    def build_list(self, names: list[str] | None = None) -> list[Build]:
        if names:
            return [self.build(n) for n in names]
        return list(self.builds.values()) or [Build(name="system")]


# --------------------------------------------------------------------------- #
# loading
# --------------------------------------------------------------------------- #
def candidate_paths() -> list[Path]:
    paths: list[Path] = []
    env = os.environ.get(CONFIG_ENV)
    if env:
        paths.append(Path(env).expanduser())
    paths.append(Path.cwd() / "vidprobe.toml")
    paths.append(Path.cwd() / ".vidprobe.toml")
    xdg = os.environ.get("XDG_CONFIG_HOME")
    base = Path(xdg).expanduser() if xdg else Path.home() / ".config"
    paths.append(base / "vidprobe" / CONFIG_NAME)
    paths.append(Path("/etc/vidprobe") / CONFIG_NAME)
    return paths


def find_config() -> Path | None:
    for path in candidate_paths():
        if path.is_file():
            return path
    return None


def _read(path: Path) -> dict:
    raw = path.read_bytes()
    if path.suffix.lower() == ".json":
        try:
            return json.loads(raw.decode("utf-8"))
        except json.JSONDecodeError as exc:
            raise ConfigError(f"{path}: invalid JSON - {exc}") from exc
    try:
        return tomllib.loads(raw.decode("utf-8"))
    except tomllib.TOMLDecodeError as exc:
        raise ConfigError(f"{path}: invalid TOML - {exc}") from exc
    except UnicodeDecodeError as exc:
        raise ConfigError(f"{path}: not valid UTF-8 - {exc}") from exc


def _section(data: dict, name: str) -> dict:
    value = data.get(name) or {}
    if not isinstance(value, dict):
        raise ConfigError(f"[{name}] must be a table, got {type(value).__name__}")
    return value


def load_config(path: str | os.PathLike | None = None) -> Config:
    """Load config from `path`, or from the first standard location that exists."""
    resolved = Path(path).expanduser() if path else find_config()
    config = Config(path=resolved)
    if resolved is None:
        return config
    if not resolved.is_file():
        raise ConfigError(f"config file not found: {resolved}")

    data = _read(resolved)

    general = _section(data, "general")
    config.default_build = general.get("default_build", config.default_build)
    config.timeout = float(general.get("timeout", config.timeout))
    config.analyze = float(general.get("analyze", config.analyze))
    config.output_dir = general.get("output_dir", config.output_dir)
    config.overwrite = bool(general.get("overwrite", config.overwrite))

    for name, entry in _section(data, "builds").items():
        if isinstance(entry, str):  # shorthand: name = "/path/to/ffmpeg"
            entry = {"ffmpeg": entry}
        if not isinstance(entry, dict):
            raise ConfigError(f"[builds.{name}] must be a table or a path string")
        ffmpeg_path = entry.get("ffmpeg", "ffmpeg")
        default_probe = "ffprobe"
        if os.path.sep in ffmpeg_path:  # sibling ffprobe in the same directory
            sibling = Path(ffmpeg_path).with_name("ffprobe")
            default_probe = str(sibling)
        config.builds[name] = Build(
            name=name,
            ffmpeg=ffmpeg_path,
            ffprobe=entry.get("ffprobe", default_probe),
            label=entry.get("label", ""),
            extra_args=[str(a) for a in entry.get("extra_args", [])],
            env={str(k): str(v) for k, v in (entry.get("env") or {}).items()},
            note=entry.get("note", ""),
        )

    languages = _section(data, "languages")
    if languages:
        preferred = languages.get("preferred", config.languages.preferred)
        if isinstance(preferred, str):
            preferred = [preferred]
        config.languages = LanguagePolicy(
            preferred=[str(p) for p in preferred],
            keep_undetermined=bool(
                languages.get("keep_undetermined", config.languages.keep_undetermined)
            ),
            keep_default_stream=bool(
                languages.get(
                    "keep_default_stream", config.languages.keep_default_stream
                )
            ),
            fallback_keep_first=bool(
                languages.get(
                    "fallback_keep_first", config.languages.fallback_keep_first
                )
            ),
            apply_to=[
                str(x) for x in languages.get("apply_to", config.languages.apply_to)
            ],
        )

    thumbs = _section(data, "thumbnails")
    if thumbs:
        defaults = ThumbnailDefaults()
        for key in vars(defaults):
            if key in thumbs:
                setattr(defaults, key, type(getattr(defaults, key))(thumbs[key]))
        config.thumbnails = defaults

    cut = _section(data, "cut")
    if cut:
        defaults = CutDefaults()
        for key in vars(defaults):
            if key in cut:
                setattr(defaults, key, type(getattr(defaults, key))(cut[key]))
        config.cut = defaults

    return config


SAMPLE_CONFIG = """# vidprobe configuration

[general]
default_build = "system"
timeout = 20.0
analyze = 5.0
overwrite = false

# Register as many FFmpeg builds as you like, then use --build/-B to pick one
# or `vidprobe bench` to race them against each other on the same workload.
[builds.system]
label = "distro ffmpeg"
ffmpeg = "ffmpeg"
ffprobe = "ffprobe"

# [builds.jellyfin]
# label = "jellyfin-ffmpeg (QSV/VAAPI)"
# ffmpeg = "/usr/lib/jellyfin-ffmpeg/ffmpeg"
# note = "hardware accelerated build"

# [builds.btbn]
# label = "BtbN static + libvmaf"
# ffmpeg = "~/opt/ffmpeg-master/bin/ffmpeg"
# extra_args = ["-threads", "0"]
# env = { LD_LIBRARY_PATH = "/opt/ffmpeg-master/lib" }

# Shorthand form - just the ffmpeg path, ffprobe is assumed to sit next to it:
# [builds]
# nightly = "/opt/ffmpeg-nightly/bin/ffmpeg"

[languages]
preferred = ["eng", "slv"]
keep_undetermined = true    # keep streams tagged 'und'
keep_default_stream = true  # never drop the stream flagged as default
fallback_keep_first = true  # if nothing matches, keep the first stream of that type
apply_to = ["audio", "subtitle"]

[thumbnails]
width = 320
interval = 10.0
count = 12
scene_threshold = 0.35
quality = 3
format = "jpg"
sprite_columns = 5
sprite_rows = 5

[cut]
duration = 60.0
accurate = false
"""
