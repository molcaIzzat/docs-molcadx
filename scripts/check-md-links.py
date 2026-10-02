#!/usr/bin/env python3
"""Check relative markdown links + GitHub-style heading anchors across the repo.

Usage: python3 scripts/check-md-links.py [root]
Exit 0 always; prints summary. Focus filter via --prod for PRODUCTION path hits.
"""
from __future__ import annotations
import os, re, sys
from pathlib import Path

SKIP_DIRS = {'.git', 'graphify-out', 'node_modules'}
link_re = re.compile(r'\[([^\]]*)\]\(([^)]+)\)')

def gh_slug(heading: str) -> str:
    s = heading.replace('`', '')
    s = re.sub(r'\[([^\]]*)\]\([^)]*\)', r'\1', s)
    s = s.lower()
    out = []
    for ch in s:
        if ch.isalnum() or ch in ' -_':
            out.append(ch)
    return ''.join(out).strip().replace(' ', '-')

def collect_anchors(text: str) -> set[str]:
    return {gh_slug(h) for h in re.findall(r'^#{1,6}\s+(.+)$', text, re.M)}

def check_tree(root: Path):
    md_files = {}
    for dirpath, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for f in files:
            if not f.endswith('.md'):
                continue
            p = Path(dirpath) / f
            rel = p.relative_to(root).as_posix()
            try:
                text = p.read_text(encoding='utf-8')
            except Exception:
                continue
            md_files[rel] = (p, text, collect_anchors(text))

    broken, ok = [], 0
    for rel, (path, text, anchors) in md_files.items():
        for m in link_re.finditer(text):
            url = m.group(2).strip()
            if ' "' in url:
                url = url.split(' "')[0]
            line = text[: m.start()].count('\n') + 1
            snippet = m.group(0)[:120]
            if url.startswith(('http://', 'https://', 'mailto:')):
                ok += 1
                continue
            if url.startswith('#'):
                frag = url[1:]
                if frag and frag not in anchors:
                    broken.append((rel, line, snippet, 'missing-anchor-samefile'))
                else:
                    ok += 1
                continue
            if '://' in url:
                ok += 1
                continue
            if '#' in url:
                path_part, frag = url.split('#', 1)
            else:
                path_part, frag = url, None
            if not path_part:
                ok += 1
                continue
            target = (path.parent / path_part).resolve()
            try:
                target_rel = target.relative_to(root).as_posix()
            except ValueError:
                broken.append((rel, line, snippet, 'outside-repo'))
                continue
            if not target.exists():
                broken.append((rel, line, snippet, 'missing-file'))
                continue
            if frag and target_rel in md_files:
                if frag not in md_files[target_rel][2]:
                    broken.append((rel, line, snippet, 'missing-anchor'))
                    continue
            ok += 1
    return ok, broken

def main():
    root = Path(sys.argv[1] if len(sys.argv) > 1 else '.').resolve()
    ok, broken = check_tree(root)
    prod = [b for b in broken if any(x in b[2] for x in (
        '01-planning.md', '02-monitoring.md', '03-performance.md',
        'job-schedule', 'oee-monitoring', 'shopfloor', 'work-schedule-draft', 'PRODUCTION/DOCS'))]
    print(f'ok={ok} broken={len(broken)} prod_related_broken={len(prod)}')
    for b in prod:
        print(f'  {b[0]}:{b[1]} {b[3]} {b[2]}')

if __name__ == '__main__':
    main()
