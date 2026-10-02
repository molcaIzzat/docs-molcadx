#!/usr/bin/env python3
"""Check Markdown files render in GitHub and Obsidian (DOCS/03-prd-standard.md §3.6).

Usage: python3 check_render.py FILE.md [FILE.md ...]
Prints one line per problem; prints nothing and exits 0 when clean.
"""
import re
import sys

SEP = re.compile(r"^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$")
TAG = re.compile(r"(?<!\\)<(/?[A-Za-z][^<>\n]{0,60})>")


def cells(line):
    s = line.strip()
    s = s[1:] if s.startswith("|") else s
    s = s[:-1] if s.endswith("|") and not s.endswith("\\|") else s
    return len(re.split(r"(?<!\\)\|", s))


def check(path):
    problems = []
    lines = open(path, encoding="utf-8").read().split("\n")
    fence = None
    for n, line in enumerate(lines, 1):
        body = re.sub(r"^\s*(>\s?)*", "", line)  # fences also live inside callouts
        m = re.match(r"(```|~~~)", body)
        if m:
            fence = None if fence == m.group(1) else (fence or m.group(1))
            continue
        if fence:
            continue
        text = re.sub(r"\]\([^)]*\)", "]()", re.sub(r"`[^`\n]*`", "", line))
        for t in TAG.finditer(text):
            name = t.group(1).lstrip("/").split()[0].lower().rstrip("/")
            if name != "br":
                problems.append(f"{path}:{n}: bare <{t.group(1)}> - escape as \\<...\\> (or <details> -> callout)")
        if re.match(r"^\s+\|", line):
            problems.append(f"{path}:{n}: table indented under a list item")
        if line.startswith("|") and (n == 1 or not lines[n - 2].startswith("|")):
            if n == len(lines) or not SEP.match(lines[n]):
                problems.append(f"{path}:{n}: table has no |---| separator row")
                continue
            width, j = cells(line), n
            while j < len(lines) and lines[j].startswith("|"):
                if cells(lines[j]) != width:
                    problems.append(f"{path}:{j + 1}: {cells(lines[j])} cells, header has {width}")
                j += 1
            if j < len(lines) and lines[j].strip() and not lines[j].startswith("#"):
                problems.append(f"{path}:{j + 1}: no blank line after the table (or a row wrapped onto this line)")
    return problems


if __name__ == "__main__":
    found = [p for f in sys.argv[1:] for p in check(f)]
    print("\n".join(found)) if found else None
    sys.exit(1 if found else 0)
