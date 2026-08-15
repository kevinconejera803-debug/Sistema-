from __future__ import annotations

import json
import sys
from pathlib import Path


WORKSPACE_ROOT = Path(__file__).resolve().parents[2]
POLICY_FILES = [
    WORKSPACE_ROOT / "config" / "tooling" / "workspace-layout.json",
    WORKSPACE_ROOT / "gestor_tu_espacio" / "config" / "tooling" / "project-layout.json",
]


def load_policy(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def validate_root(policy: dict) -> tuple[str, list[str], list[str]]:
    root = (WORKSPACE_ROOT / policy["root"]).resolve()
    allowed_files = set(policy.get("allowed_files", []))
    allowed_directories = set(policy.get("allowed_directories", []))

    unexpected_files: list[str] = []
    unexpected_directories: list[str] = []

    for entry in sorted(root.iterdir(), key=lambda item: item.name.lower()):
        if entry.is_file() and entry.name not in allowed_files:
            unexpected_files.append(entry.name)
            continue

        if entry.is_dir() and entry.name not in allowed_directories:
            unexpected_directories.append(entry.name)

    return policy["label"], unexpected_files, unexpected_directories


def main() -> int:
    failures: list[tuple[str, list[str], list[str]]] = []

    for policy_file in POLICY_FILES:
        policy = load_policy(policy_file)
        result = validate_root(policy)
        if result[1] or result[2]:
            failures.append(result)

    if not failures:
        print("Layout validation passed.")
        for policy_file in POLICY_FILES:
            policy = load_policy(policy_file)
            print(f"- {policy['label']}: OK")
        return 0

    print("Layout validation failed.")
    for label, unexpected_files, unexpected_directories in failures:
        print(f"\n[{label}]")
        if unexpected_files:
            print("  Unexpected files:")
            for item in unexpected_files:
                print(f"  - {item}")
        if unexpected_directories:
            print("  Unexpected directories:")
            for item in unexpected_directories:
                print(f"  - {item}")

    print("\nAllowed layout is defined in:")
    for policy_file in POLICY_FILES:
        print(f"- {policy_file.relative_to(WORKSPACE_ROOT)}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
