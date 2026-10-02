#!/usr/bin/env bash
# Usage: prd-delta.sh [product-dir]
# For each repo under <product>/repo-molcadx, print the prd-molcadx commit it was last built against and
# the PRD commits since. Exact when the repo's log has a "PRD-synced: prd-molcadx@<sha>" trailer;
# otherwise a date guess (last PRD commit before the repo's last commit).
set -euo pipefail
product="${1:-$(pwd)}"
[ -d "$product/prd-molcadx" ] || product="$(cd "$product/.." && pwd)"
[ -d "$product/prd-molcadx" ] || product="$(cd "$product/.." && pwd)"
prd="$product/prd-molcadx"
repos="$product/repo-molcadx"
[ -d "$prd/.git" ] || { echo "prd-molcadx not found from $1" >&2; exit 1; }

echo "PRD HEAD: $(git -C "$prd" log -1 --format='%h %ad %s' --date=iso)"
echo
for r in "$repos"/*/; do
  [ -d "$r/.git" ] || continue
  name="$(basename "$r")"
  sha="$(git -C "$r" log --format=%B | grep -m1 -oE 'PRD-synced: prd-molcadx@[0-9a-f]+' | sed 's/.*@//' || true)"
  how="trailer"
  if [ -z "$sha" ]; then
    when="$(git -C "$r" log -1 --format=%cI)"
    sha="$(git -C "$prd" log -1 --before="$when" --format=%h)"
    how="date guess (repo last commit $when)"
  fi
  dirty="$(git -C "$r" status --short | wc -l | tr -d ' ')"
  echo "== $name"
  echo "   built against: prd-molcadx@$sha  [$how]"
  echo "   uncommitted files already present: $dirty"
  count="$(git -C "$prd" rev-list --count "$sha"..HEAD)"
  if [ "$count" = 0 ]; then
    echo "   up to date"
  else
    echo "   $count PRD commits since:"
    # Only the non-merge commits carry content; merges just repeat them.
    git -C "$prd" log --no-merges --format='     %h %ad %s' --date=short "$sha"..HEAD | head -15
    [ "$count" -gt 30 ] && echo "     … older commits omitted (see git log)"
    echo "   files: $(git -C "$prd" diff --name-only "$sha"..HEAD -- ':!*/90-*' ':!*/99-*' | tr '\n' ' ')"
  fi
done
