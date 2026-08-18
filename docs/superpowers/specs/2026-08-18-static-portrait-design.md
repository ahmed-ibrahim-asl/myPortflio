# Static Portrait Design

## Goal

Restore Ahmed's own portrait as the only visual in the Home and About introductions. Remove the animated engineering scene and the unrelated hardware-bench photograph.

## Considered approaches

1. **Static portrait in a restrained frame — selected.** Keeps the existing portrait readable against the dark site while removing all motion and secondary imagery.
2. **Completely frameless portrait.** More literal, but the white portrait background would meet the dark page abruptly and look unfinished.
3. **Static portrait with a caption.** Adds context, but conflicts with the request for only the photograph.

## Approved experience

- Home and About each show the existing portrait from portfolio data.
- Remove the `PixelWorld` scene from the Home hero.
- Remove the hardware-bench photograph, animated signal, scene labels, and related decorative elements.
- Keep a simple, non-animated frame that sizes the portrait consistently and responsively.
- Preserve descriptive alternative text for accessibility.
- Do not alter the surrounding page copy, calls to action, navigation, or tools.

## Implementation boundary

Replace the shared two-image component with a single-purpose static portrait component and remove the unused Home scene import. Delete the obsolete image-pair and animation CSS. Update the existing responsive contract so both pages require one portrait and reject the removed scene elements.

## Verification

- Regression test fails against the current two-image animated implementation.
- Responsive route checks confirm one portrait on Home and About, no scene/bench/signal elements, and no horizontal overflow.
- TypeScript, the full test suite, and the production export succeed.
- Visual inspection confirms that the portrait is the only hero image at desktop and mobile widths.
