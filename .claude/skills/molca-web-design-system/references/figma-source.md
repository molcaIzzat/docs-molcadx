# Figma source & MCP workflow

## File

- **Name:** Molca — Shadcn Design System
- **URL:** https://www.figma.com/design/mvVIgPwuzefi1XA90TstQ6/Molca---Shadcn-Design-System
- **File key:** `mvVIgPwuzefi1XA90TstQ6`
- **Surface:** Web (backoffice / browser apps)

## Key node IDs

| Section | Category | Node ID | URL node-id |
|---------|----------|---------|-------------|
| Buttons canvas | mixed | `164:223` | `164-223` |
| Button | components/actions | `11458:35124` | — |
| Button doc frame | components/actions | `11458:34382` | — |
| Icon Button | components/actions | `1334:774` | — |
| Button Group section | patterns | `11762:857` | — |

Example deep link:

```
https://www.figma.com/design/mvVIgPwuzefi1XA90TstQ6/Molca---Shadcn-Design-System?node-id=164-223
```

## Reading from Figma (agent workflow)

Use the Figma MCP server (`plugin-figma-figma`):

1. **`get_metadata`** — file structure and variant names (cheap; use to plan).
2. **`get_design_context`** — reference code, screenshot, asset URLs for a specific node.
3. **`get_variable_defs`** — token names and resolved values for that node.

Always pass:

- `fileKey`: `mvVIgPwuzefi1XA90TstQ6`
- `nodeId`: target node, e.g. `11458:35125` (convert `164-223` → `164:223`)

Example symbol for Primary xs Default:

```
nodeId: 11458:35125
name: Size=xs, Type=Primary, Icon=Default, State=Default
```

## Adapting MCP output

Figma MCP returns React + Tailwind **reference** code. Before committing:

1. Map Tailwind arbitrary vars to project CSS variables (see shadcn `index.css` / `@theme`).
2. Replace generated `<div>` buttons with `@/components/ui/button` + CVA variants.
3. Do not install Tailwind solely because Figma exported Tailwind classes.
4. Asset URLs from MCP expire in ~7 days — use lucide-react icons in code instead.

## Rate limits

Figma MCP calls may hit plan limits on View seats. When limited:

- Use bundled `references/**/*.md` in this skill
- Ask the user to export tokens or select the layer in Figma Desktop and retry
- Batch reads: metadata first, then design_context only for nodes you will implement
