# Quick Checklist

Before approving any UI work:

## shadcn/ui Component Compliance
- [ ] Component verified in shadcn/ui component library
- [ ] Component implementation follows shadcn/ui API patterns
- [ ] Proper imports from `@/components/ui/`
- [ ] CSS variables used (no hardcoded hex colors or pixel values)
- [ ] All props/children follow shadcn/ui conventions
- [ ] All variants/states implemented as documented
- [ ] Deviations documented with rationale

## Aesthetic Quality (especially for new designs)
- [ ] Clear conceptual direction (not generic overused fonts and cliched schemes)
- [ ] Distinctive typography (avoid overused fonts)
- [ ] Cohesive color palette with CSS variables
- [ ] Intentional motion (staggered reveals, hover states)
- [ ] Visual interest through composition (asymmetry, overlap, grid-breaking)
- [ ] Atmosphere through backgrounds (gradients, textures, patterns)
- [ ] Implementation complexity matches vision

## Frictionless
- [ ] Core task completable efficiently (≤3 interactions)
- [ ] Single clear primary action per view

## Quality Craft
- [ ] Uses shadcn/ui components (verified in docs)
- [ ] CSS variables used (no hardcoded values)
- [ ] Distinctive aesthetic (not generic overused fonts/cliched schemes)
- [ ] Accessible (Grade C minimum, Grade B ideal)
- [ ] Keyboard navigation complete
- [ ] Tested in light/dark/high contrast modes

## Trustworthy
- [ ] AI-generated content has disclaimer
- [ ] Error messages are actionable