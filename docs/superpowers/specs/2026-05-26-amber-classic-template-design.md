# Amber Classic Template — Design

**Date:** 2026-05-26
**Author:** ysingh (with Claude)
**Reference:** [BioSample/prachi-chauhan-biodata.pdf](../../../BioSample/prachi-chauhan-biodata.pdf)

## Goal

Add a new "Amber Classic" template to the biodata template gallery whose
**on-screen preview** reproduces the *visual* style of the reference PDF:
ornate gold corner brackets, gold double-line border, and a faint dotted
background texture. Apply the existing app's amber/gold color palette.

## Out of Scope

- The downloaded PDF — keeps using the existing generic `generatePDF()` in
  [frontend/src/pages/Preview.tsx:37](../../../frontend/src/pages/Preview.tsx#L37). No
  changes to `jsPDF` code, no unification with `html2canvas`. The downloaded
  PDF for this template will look different from the preview.
- Section header bars (no orange "PERSONAL DETAILS / FAMILY DETAILS /
  CONTACT INFORMATION" bars). Fields render as the existing flat list.
- Static text from the reference PDF: no "weddingbiodata.in" footer, no
  "Om" symbol image, no "Shree Ganesh / BIODATA" headings for this template.
- Layout changes: no photo-right positioning, no two-column field
  layout. Existing preview structure stays.
- Filename change: keep `biodata_<FullName>.pdf` from
  [Preview.tsx:162](../../../frontend/src/pages/Preview.tsx#L162).

## Template Metadata

| Field | Value |
|---|---|
| `id` | `amber-classic` |
| `name` | `Amber Classic` |
| `price` | `29` |
| `category` | `Premium` |
| `description` | `Ornate gold corners on a soft cream backdrop` |
| `colors.primary` | `#C8951B` (amber gold) |
| `colors.secondary` | `#8B6914` (dark gold) |
| `colors.accent` | `#FBBF24` (light amber) |
| `colors.background` | `#FFFAF0` (cream) |
| `borderStyle` | `double` |
| `preview` | `amber-classic-preview` |

## Visual Spec

### Border (the load-bearing visual)

- Four **ornate corner brackets** in `--border-color`. Each corner is an
  L-shape with a decorative inner curl — a stylized version of the
  reference PDF's gold corner ornaments.
- Two **straight gold lines** (outer + inner, 4–6px apart) running the
  full perimeter, joining the corner brackets.
- Implemented as an inline SVG passed to the existing
  `--border-image` CSS variable hook at
  [Preview.tsx:248](../../../frontend/src/pages/Preview.tsx#L248). This means
  the user's "custom color picker" already works on the new template
  (border re-colors live).

### Background

- Solid fill: `#FFFAF0` (cream, matches `colors.background`).
- Overlay: faint dotted texture, `radial-gradient(circle, rgba(200,149,27,0.08)
  1px, transparent 1.5px) 0 0 / 14px 14px`. Subtle enough that field text
  remains fully legible.

### Content

- Header decorations (Om symbol, Shree Ganesh, BIODATA): **disabled** for
  this template. Conditional rendering in
  [Preview.tsx:254,281,290,297](../../../frontend/src/pages/Preview.tsx#L254) is
  already keyed to `template?.id === 'elegant-red'`, so the new id is
  naturally excluded — no code change needed there.
- Photo: uses the existing `.preview-photo-corner` (top-right corner,
  `--border-color` ring). Same as every other template.
- Fields: existing flat `<strong>Label:</strong> value` list. No grouping.

## Files Changed

1. **[frontend/src/data/templates.ts](../../../frontend/src/data/templates.ts)** —
   append one object (16th entry) with the metadata above.
2. **[frontend/src/pages/Preview.tsx](../../../frontend/src/pages/Preview.tsx#L186-L192)** —
   add `'amber-classic'` key to the `svgPatterns` object with the ornate
   corner + double border SVG, using `${encodedColor}` for the stroke
   so the live custom-color picker works.
3. **[frontend/src/pages/CreateBiodataNew.css](../../../frontend/src/pages/CreateBiodataNew.css)** —
   append three rules at the end of the "ORNATE BORDER FRAMES" section
   (~line 1574+):
   - `.border-template-amber-classic.template-preview-box::before` — static
     gold-stroke SVG fallback for the template card thumbnail.
   - `.border-template-amber-classic.biodata-preview-mini::before` — same
     SVG for the live preview pane.
   - `.border-template-amber-classic { background: #FFFAF0 url("data:image/svg+xml,...") repeat; }` —
     cream fill + dotted-star overlay.

No new files. No changes outside `frontend/src/`.

## Risk / Edge Cases

- **CSS specificity:** the dotted-bg rule must not be overridden by the
  generic `.biodata-preview-mini` background-color in CreateBiodataNew.css.
  Use the same selector ordering as existing templates (`.border-template-X`
  applied alongside `.biodata-preview-mini`).
- **SVG `preserveAspectRatio`:** corner SVG must not stretch with the
  preview pane. Reuse the existing pattern: viewBox `0 0 400 600`,
  `preserveAspectRatio='none'` on borders, but the corner ornaments are
  drawn at fixed pixel positions within that viewBox so they appear at the
  four corners regardless of pane size.
- **Print contrast:** if a user later prints the preview (browser print),
  the dotted overlay might over-render. Acceptable for v1 — print
  optimization is out of scope.

## Verification

- Open http://localhost:3000, click "Get Started Now", complete a
  biodata, reach the template picker. "Amber Classic" appears in the
  Premium category at ₹29 with a thumbnail showing the gold ornate frame
  on cream.
- Select it. The live preview pane shows: gold ornate corners, double
  gold line border, faint dotted cream background, no Om/Shree
  Ganesh/BIODATA text, all entered fields.
- Use the color picker to change the border color (the existing
  `customColor` flow). The SVG re-strokes to that color live.
- Download PDF works (uses generic look — known, in spec).
