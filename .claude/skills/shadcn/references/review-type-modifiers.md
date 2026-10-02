# Review Type Modifiers

Adjust focus based on review context:

## PR Review
- **Focus**: Code implementation, shadcn/ui component usage, design token usage, accessibility in code
- **Check**: Proper imports from `@/components/ui/...`, CSS variables used (not hardcoded), ARIA attributes present
- **Verify**: Component matches shadcn/ui API specs

## Creative Frontend Review
- **Focus**: Aesthetic direction, typography choices, visual distinctiveness, motion design
- **Check**: Clear conceptual intent, avoiding generic AI patterns, cohesive execution
- **Verify**: Implementation complexity matches vision (maximalist needs elaborate code, minimalist needs precision)

## Design Review
- **Focus**: User flows, interaction patterns, visual hierarchy, navigation, shadcn/ui alignment
- **Check**: Task completion path, action hierarchy, progressive disclosure
- **Verify**: All components exist in shadcn/ui or have documented exceptions

## Accessibility Audit
- **Focus**: Deep dive Quality Craft pillar
- **Check**: Keyboard testing, screen reader testing, contrast ratios, ARIA patterns
- **Test with**: Screen readers (NVDA, JAWS, Narrator), keyboard only, 200% zoom
- **Verify**: shadcn/ui accessibility features are properly implemented

## shadcn/ui Compliance Audit
- **Focus**: Deep dive component usage
- **Check**: All components match shadcn/ui API, CSS variables used throughout, no hardcoded values
- **Test**: Compare implementation with official shadcn/ui documentation
- **Verify**: Component variants, props, children all match shadcn/ui patterns
- **Document**: Any deviations with rationale and plan to align