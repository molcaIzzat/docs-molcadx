#!/usr/bin/env bash
# Export a Markdown doc (PRD or any other repo doc) to PDF or Word (.docx).
#
# Usage:
#   scripts/export-doc.sh <path/to/doc.md> [output.pdf|output.docx] [--portrait]
#
# Format is picked from the output file's extension. If no output path is
# given, defaults to "<same name>.pdf" next to the source file.
#
# Examples:
#   scripts/export-doc.sh ../prd-molcadx/PRD-003-foundation/07-kpi.md
#   scripts/export-doc.sh ../prd-molcadx/PRD-003-foundation/07-kpi.md PRD-003.docx
#   scripts/export-doc.sh ../prd-molcadx/PRD-003-foundation/07-kpi.md /tmp/prd003.pdf --portrait
#
# Requires:
#   - Word (.docx):  pandoc only.
#   - PDF:           pandoc + wkhtmltopdf.
#   Debian/Ubuntu: sudo apt-get install -y pandoc wkhtmltopdf
#   macOS:         brew install pandoc wkhtmltopdf
#
# Notes:
# - PDF defaults to A4 landscape because most PRD tables here (user story
#   summary tables, entity field tables, task breakdowns) are too wide for
#   portrait without aggressive wrapping. Pass --portrait to override.
#   Word export uses pandoc's default page size/orientation — wide tables
#   will shrink-to-fit or overflow depending on the Word viewer; there is no
#   equivalent orientation flag for docx via plain pandoc.
# - Relative links to *other* repo docs (e.g. "../01-glossary.md") are not
#   resolved into the output — pandoc converts one file at a time. Cross-doc
#   links render as plain text/inert links in both formats, which is expected.
# - PDF styling lives in scripts/pdf-style.css — edit that file to change
#   fonts, table density, etc. Word styling is pandoc's default docx
#   template; pass --reference-doc yourself if you need custom Word styles
#   (not wired up here — ask if you need this).

set -euo pipefail

usage() {
  echo "Usage: $0 <path/to/doc.md> [output.pdf|output.docx] [--portrait]" >&2
  exit 1
}

[ "$#" -ge 1 ] || usage

SRC=""
OUT=""
ORIENTATION="Landscape"

for arg in "$@"; do
  case "$arg" in
    --portrait)
      ORIENTATION="Portrait"
      ;;
    *)
      if [ -z "$SRC" ]; then
        SRC="$arg"
      elif [ -z "$OUT" ]; then
        OUT="$arg"
      fi
      ;;
  esac
done

[ -n "$SRC" ] || usage
[ -f "$SRC" ] || { echo "Not found: $SRC" >&2; exit 1; }

if [ -z "$OUT" ]; then
  OUT="${SRC%.md}.pdf"
fi

case "$OUT" in
  *.docx) FORMAT="docx" ;;
  *.pdf)  FORMAT="pdf" ;;
  *)
    echo "Output must end in .pdf or .docx, got: $OUT" >&2
    exit 1
    ;;
esac

if ! command -v pandoc >/dev/null 2>&1; then
  echo "pandoc not found. Install: sudo apt-get install -y pandoc (add wkhtmltopdf too if you need PDF) — or: brew install pandoc" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TITLE="$(basename "$SRC" .md)"

if [ "$FORMAT" = "docx" ]; then
  pandoc "$SRC" \
    --from=gfm \
    --standalone \
    --toc \
    --toc-depth=2 \
    --metadata title="$TITLE" \
    -o "$OUT"
else
  if ! command -v wkhtmltopdf >/dev/null 2>&1; then
    echo "wkhtmltopdf not found (needed for PDF). Install: sudo apt-get install -y wkhtmltopdf — or: brew install wkhtmltopdf" >&2
    exit 1
  fi
  pandoc "$SRC" \
    --from=gfm \
    --standalone \
    --pdf-engine=wkhtmltopdf \
    --pdf-engine-opt=--enable-local-file-access \
    --pdf-engine-opt=--orientation \
    --pdf-engine-opt="$ORIENTATION" \
    --pdf-engine-opt=--margin-top --pdf-engine-opt=15mm \
    --pdf-engine-opt=--margin-bottom --pdf-engine-opt=15mm \
    --pdf-engine-opt=--margin-left --pdf-engine-opt=12mm \
    --pdf-engine-opt=--margin-right --pdf-engine-opt=12mm \
    --css="$SCRIPT_DIR/pdf-style.css" \
    --toc \
    --toc-depth=2 \
    --metadata title="$TITLE" \
    -o "$OUT"
fi

echo "Wrote $OUT"
