# Button patterns

> **Category:** patterns  
> Figma section `11762:857` · [Buttons canvas](https://www.figma.com/design/mvVIgPwuzefi1XA90TstQ6/Molca---Shadcn-Design-System?node-id=164-223)

Composed blocks built from [Button](../components/actions/button.md) and related components.

## Index

| Pattern | Figma node | shadcn approach |
|---------|------------|-----------------|
| Button Group | `13018:70074` | `ToggleGroup` or grouped `Button`s with shared radius |
| Button Orientation | `13018:70075` | Vertical `flex flex-col` button stack |
| Button Group (sizes) | `13018:69733` | small / default / large segmented groups |
| Button Split | `13018:70078` | Primary `Button` + `DropdownMenu` chevron |
| Input Search | `13018:70079` | `Input` + search icon — see **forms** when documented |
| Input Group | `13018:70080` | `InputGroup` — see **forms** when documented |
| Dropdown Menu | `13018:69843` | `DropdownMenu` — see **overlays** when documented |
| Dropdown Select | `13018:69893` | `Select` — see **forms** when documented |
| Dropdown Popover | `13018:69937` | `Popover` — see **overlays** when documented |

## Button Group sizes

| Figma variant | Height |
|---------------|--------|
| Size=small | 32px |
| Size=default | 36px |
| Size=large | 40px |

Map to Molca button sizes xs / sm / md when composing groups.

## Status

Sizes/labels verified against Figma (frame `11762:857`). All patterns are implemented
as composed components in the engineering preset:
[`engineer/shadcn/references/molca-preset/patterns.tsx`](../../../../engineer/shadcn/references/molca-preset/patterns.tsx)
— Button Group, segmented sizes, Orientation, Split, Input Search, Input Group,
Dropdown Menu, currency Select, and the agent-task Popover.
