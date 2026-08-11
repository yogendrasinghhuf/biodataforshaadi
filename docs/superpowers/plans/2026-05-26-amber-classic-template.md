# Amber Classic Template Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **PROJECT RULES:** No git operations (init/commit/branch/PR) — user opted out. Skip every "Commit" step that other skills assume. All work strictly within `c:\MarriageBiodata`.

**Goal:** Add a new "Amber Classic" template (id `amber-classic`, ₹29, Premium category) whose live preview shows the ornate gold corner + double-line border + dotted cream background of the reference PDF.

**Architecture:** Pure additive change across 3 files in [frontend/src/](../../../frontend/src/). New template entry → new SVG pattern keyed by template id → new CSS rules scoped by `.border-template-amber-classic`. Reuses the existing `--border-image` CSS variable hook so the live custom-color picker works for free. No PDF generator changes. No git work.

**Tech Stack:** TypeScript, React 19, plain CSS, inline SVG (URL-encoded data URIs).

**Reference spec:** [docs/superpowers/specs/2026-05-26-amber-classic-template-design.md](../specs/2026-05-26-amber-classic-template-design.md)

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| [frontend/src/data/templates.ts](../../../frontend/src/data/templates.ts) | Modify (append entry) | Metadata: id, name, price, category, colors, borderStyle |
| [frontend/src/pages/Preview.tsx](../../../frontend/src/pages/Preview.tsx) | Modify (add map key) | Per-id SVG pattern used by `generateBorderSVG()` — drives the dynamic border in live preview |
| [frontend/src/pages/CreateBiodataNew.css](../../../frontend/src/pages/CreateBiodataNew.css) | Modify (append rules) | Static SVG fallback for template-gallery thumbnail + cream/dotted background |

No new files. No test files (existing project has no test suite; visual verification via running app).

---

## Task 1: Add `amber-classic` template metadata

**Files:**
- Modify: [frontend/src/data/templates.ts](../../../frontend/src/data/templates.ts) (append before the closing `];` at line 227)

- [ ] **Step 1.1: Append the new template entry**

Open [frontend/src/data/templates.ts](../../../frontend/src/data/templates.ts). After the `peacock-green` object (ends at line 226 with `}`), and before the closing `];` of the `templates` array, add a comma after that `}` and append:

```typescript
  {
    id: 'amber-classic',
    name: 'Amber Classic',
    price: 29,
    description: 'Ornate gold corners on a soft cream backdrop',
    category: 'Premium',
    colors: {
      primary: '#C8951B',
      secondary: '#8B6914',
      accent: '#FBBF24',
      background: '#FFFAF0'
    },
    preview: 'amber-classic-preview',
    borderStyle: 'double'
  }
```

Final lines around 226–228 should read:

```typescript
    preview: 'peacock-green-preview',
    borderStyle: 'inset'
  },
  {
    id: 'amber-classic',
    name: 'Amber Classic',
    price: 29,
    description: 'Ornate gold corners on a soft cream backdrop',
    category: 'Premium',
    colors: {
      primary: '#C8951B',
      secondary: '#8B6914',
      accent: '#FBBF24',
      background: '#FFFAF0'
    },
    preview: 'amber-classic-preview',
    borderStyle: 'double'
  }
];
```

- [ ] **Step 1.2: Verify TypeScript compiles**

The dev server (already running, task `bq71qe1h0`) auto-recompiles on save. Watch the dev-server output file:

```powershell
Get-Content "C:\Users\ysingh\AppData\Local\Temp\claude\c--MarriageBiodata\b269daca-ca34-49bd-8ee0-509070c71842\tasks\bq71qe1h0.output" -Tail 20
```

Expected: a fresh `Compiled successfully.` or `Compiled with warnings.` line (the existing 4 unused-var warnings are fine; **no** new errors mentioning `templates.ts`).

- [ ] **Step 1.3: Confirm the template appears in the gallery**

Hit the running app:

```powershell
$h = Invoke-WebRequest -Uri 'http://localhost:3000/templates' -UseBasicParsing
$h.StatusCode  # expect 200
```

Then in a real browser, navigate to http://localhost:3000/templates and confirm a 16th card titled **Amber Classic** with **₹29** in the **Premium** category appears. The card preview will look generic at this step — that's expected (Task 3 styles it).

---

## Task 2: Add the `amber-classic` SVG border pattern to `Preview.tsx`

**Files:**
- Modify: [frontend/src/pages/Preview.tsx:186-192](../../../frontend/src/pages/Preview.tsx#L186-L192) (the `svgPatterns` object inside `generateBorderSVG`)

The `svgPatterns` object maps template id → SVG markup with `${encodedColor}` substituted in for the stroke. The live preview reads this via the `--border-image` CSS variable (see line 248) — when the user changes the color via the custom-color picker, the SVG re-strokes live.

- [ ] **Step 2.1: Add the `'amber-classic'` key to `svgPatterns`**

In [frontend/src/pages/Preview.tsx](../../../frontend/src/pages/Preview.tsx), find the `svgPatterns` object literal (starts around line 186). After the `'royal-red'` entry (which ends with a closing backtick and `,` around line 191), add a new key. The resulting block should read:

```typescript
      'royal-red': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><defs><style>.border{fill:none;stroke:${encodedColor};stroke-width:2.5;stroke-linecap:round;}.fill{fill:${encodedColor};}</style></defs><g><path class='border' d='M5,5 L60,5 M5,5 L5,60 M395,5 L340,5 M395,5 L395,60 M5,595 L60,595 M5,595 L5,540 M395,595 L340,595 M395,595 L395,540'/><!-- Top border with ornate center --><path class='border' d='M80,5 L150,5 M250,5 L320,5'/><path class='border' d='M165,7 L170,7 L170,2 L175,7 L180,7 L180,2 L185,7 L190,7'/><path class='border' d='M210,7 L215,7 L215,2 L220,7 L225,7 L225,2 L230,7 L235,7'/><path class='border' d='M192,5 Q195,2 200,5 Q205,2 208,5'/><path class='border' d='M192,10 Q195,8 200,10 Q205,8 208,10'/><circle cx='200' cy='7' r='6' class='fill'/><circle cx='200' cy='7' r='3' fill='white'/><circle cx='196' cy='7' r='1.5' class='fill'/><circle cx='200' cy='4' r='1.5' class='fill'/><circle cx='204' cy='7' r='1.5' class='fill'/><circle cx='200' cy='10' r='1.5' class='fill'/><!-- Bottom  border --><path class='border' d='M80,595 L320,595'/><!-- Borders --><path class='border' d='M5,100 L5,500 M395,100 L395,500'/></g></svg>`,
      'amber-classic': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><defs><style>.border{fill:none;stroke:${encodedColor};stroke-width:2;stroke-linecap:square;stroke-linejoin:miter;}.inner{fill:none;stroke:${encodedColor};stroke-width:1;}.fill{fill:${encodedColor};}</style></defs><g><!-- Outer rectangle --><rect class='border' x='8' y='8' width='384' height='584'/><!-- Inner rectangle (double-line effect) --><rect class='inner' x='14' y='14' width='372' height='572'/><!-- Top-left ornate corner --><path class='border' d='M8,40 L8,8 L40,8'/><path class='border' d='M22,8 L22,22 L8,22'/><path class='fill' d='M8,8 L18,8 L18,11 L11,11 L11,18 L8,18 Z'/><!-- Top-right ornate corner --><path class='border' d='M360,8 L392,8 L392,40'/><path class='border' d='M378,8 L378,22 L392,22'/><path class='fill' d='M382,8 L392,8 L392,18 L389,18 L389,11 L382,11 Z'/><!-- Bottom-left ornate corner --><path class='border' d='M8,560 L8,592 L40,592'/><path class='border' d='M22,592 L22,578 L8,578'/><path class='fill' d='M8,582 L11,582 L11,589 L18,589 L18,592 L8,592 Z'/><!-- Bottom-right ornate corner --><path class='border' d='M360,592 L392,592 L392,560'/><path class='border' d='M378,592 L378,578 L392,578'/><path class='fill' d='M382,592 L382,589 L389,589 L389,582 L392,582 L392,592 Z'/></g></svg>`
    };
```

(Note: `'amber-classic'` is added after `'royal-red'`, immediately before the closing `};` of `svgPatterns`. The trailing comma after `'royal-red'` is preserved; no comma after `'amber-classic'` since it's the last entry. If your editor auto-adds a trailing comma, that's fine — TypeScript allows it.)

The SVG draws: a double-line gold rectangle around the full 400×600 viewBox, plus four ornate corner ornaments (L-shaped brackets with a small inner square corner accent) — the corner ornaments use **fixed pixel positions** within the viewBox so they always sit at the four corners regardless of how the preview pane is sized.

- [ ] **Step 2.2: Verify recompile + render**

Watch the dev server output (Step 1.2 command). Expect a fresh `Compiled successfully` line after save, no new errors.

In the browser, the **Templates** gallery card preview is still rendered by an abstract block layout (lines 78–88 in [Templates.tsx](../../../frontend/src/pages/Templates.tsx)) and won't show the SVG yet — that's expected. The SVG **will** appear once a user is in the actual biodata-creation flow and selects this template. Manual visual check deferred to Task 4.

---

## Task 3: Add CSS rules for the static thumbnail SVG and dotted cream background

**Files:**
- Modify: [frontend/src/pages/CreateBiodataNew.css](../../../frontend/src/pages/CreateBiodataNew.css) (append after line ~1694 in the "ORNATE BORDER FRAMES" block)

This provides three things:
1. Static SVG fallback for the thumbnail `.template-preview-box::before` (the gallery card shows this **regardless** of `Preview.tsx`, because the gallery card uses CSS-only rendering).
2. Static SVG fallback for the live preview `.biodata-preview-mini::before` (used when the user has not changed `customColor`; otherwise the `--border-image` inline style from [Preview.tsx:248](../../../frontend/src/pages/Preview.tsx#L248) takes over).
3. The cream fill + dotted-star overlay that defines the "Amber Classic" look.

- [ ] **Step 3.1: Append the three CSS rules**

Open [frontend/src/pages/CreateBiodataNew.css](../../../frontend/src/pages/CreateBiodataNew.css). Scroll to the bulk-templates rule that ends at line ~1695 (`.border-template-peacock-green.template-preview-box::before { ... }`). Immediately after that closing `}`, append:

```css
/* Template 16: Amber Classic - Ornate gold corners + double border on cream */
.border-template-amber-classic.template-preview-box::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'%3E%3Cdefs%3E%3Cstyle%3E.border%7Bfill:none;stroke:%23C8951B;stroke-width:2;stroke-linecap:square;stroke-linejoin:miter;%7D.inner%7Bfill:none;stroke:%23C8951B;stroke-width:1;%7D.fill%7Bfill:%23C8951B;%7D%3C/style%3E%3C/defs%3E%3Cg%3E%3Crect class='border' x='8' y='8' width='384' height='584'/%3E%3Crect class='inner' x='14' y='14' width='372' height='572'/%3E%3Cpath class='border' d='M8,40 L8,8 L40,8'/%3E%3Cpath class='border' d='M22,8 L22,22 L8,22'/%3E%3Cpath class='fill' d='M8,8 L18,8 L18,11 L11,11 L11,18 L8,18 Z'/%3E%3Cpath class='border' d='M360,8 L392,8 L392,40'/%3E%3Cpath class='border' d='M378,8 L378,22 L392,22'/%3E%3Cpath class='fill' d='M382,8 L392,8 L392,18 L389,18 L389,11 L382,11 Z'/%3E%3Cpath class='border' d='M8,560 L8,592 L40,592'/%3E%3Cpath class='border' d='M22,592 L22,578 L8,578'/%3E%3Cpath class='fill' d='M8,582 L11,582 L11,589 L18,589 L18,592 L8,592 Z'/%3E%3Cpath class='border' d='M360,592 L392,592 L392,560'/%3E%3Cpath class='border' d='M378,592 L378,578 L392,578'/%3E%3Cpath class='fill' d='M382,592 L382,589 L389,589 L389,582 L392,582 L392,592 Z'/%3E%3C/g%3E%3C/svg%3E");
}

.border-template-amber-classic.biodata-preview-mini::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'%3E%3Cdefs%3E%3Cstyle%3E.border%7Bfill:none;stroke:%23C8951B;stroke-width:2;stroke-linecap:square;stroke-linejoin:miter;%7D.inner%7Bfill:none;stroke:%23C8951B;stroke-width:1;%7D.fill%7Bfill:%23C8951B;%7D%3C/style%3E%3C/defs%3E%3Cg%3E%3Crect class='border' x='8' y='8' width='384' height='584'/%3E%3Crect class='inner' x='14' y='14' width='372' height='572'/%3E%3Cpath class='border' d='M8,40 L8,8 L40,8'/%3E%3Cpath class='border' d='M22,8 L22,22 L8,22'/%3E%3Cpath class='fill' d='M8,8 L18,8 L18,11 L11,11 L11,18 L8,18 Z'/%3E%3Cpath class='border' d='M360,8 L392,8 L392,40'/%3E%3Cpath class='border' d='M378,8 L378,22 L392,22'/%3E%3Cpath class='fill' d='M382,8 L392,8 L392,18 L389,18 L389,11 L382,11 Z'/%3E%3Cpath class='border' d='M8,560 L8,592 L40,592'/%3E%3Cpath class='border' d='M22,592 L22,578 L8,578'/%3E%3Cpath class='fill' d='M8,582 L11,582 L11,589 L18,589 L18,592 L8,592 Z'/%3E%3Cpath class='border' d='M360,592 L392,592 L392,560'/%3E%3Cpath class='border' d='M378,592 L378,578 L392,578'/%3E%3Cpath class='fill' d='M382,592 L382,589 L389,589 L389,582 L392,582 L392,592 Z'/%3E%3C/g%3E%3C/svg%3E");
}

.border-template-amber-classic.biodata-preview-mini {
  background-color: #FFFAF0 !important;
  background-image: radial-gradient(circle, rgba(200, 149, 27, 0.10) 1px, transparent 1.6px);
  background-size: 14px 14px;
  background-position: 0 0;
}
```

Notes:
- The two `::before` rules are character-identical except for the selector — the dual rule is the existing pattern (see `border-template-elegant-red` at lines 1578 and 1582).
- The third rule **must** override `.biodata-preview-mini { background: var(--white); }` (line 1311). `!important` on `background-color` is the existing convention in this file (see `border: none !important` at line 1415).
- `radial-gradient` overlay sits **under** the `::before` SVG border (the `::before` has `z-index: 1`, line 1427), so corners stay crisp.

- [ ] **Step 3.2: Watch the recompile**

Same command as Step 1.2:

```powershell
Get-Content "C:\Users\ysingh\AppData\Local\Temp\claude\c--MarriageBiodata\b269daca-ca34-49bd-8ee0-509070c71842\tasks\bq71qe1h0.output" -Tail 20
```

Expected: fresh `Compiled successfully` line. CSS errors (if any) show as `Syntax error` lines mentioning the file path.

---

## Task 4: End-to-end visual verification

**Files:** none modified. Browser-driven manual check.

- [ ] **Step 4.1: Confirm gallery thumbnail**

Open http://localhost:3000/templates in a real browser. Filter by **Premium** category (button at top). Confirm:
- A **16th** template card titled **Amber Classic** appears.
- Price reads **₹29**.
- The card's `.template-preview-box` shows the ornate gold corner brackets at all 4 corners + a thin gold double-line border. (The existing abstract "header bar + sample lines" content sits in front of the SVG — that's how every template card looks.)

- [ ] **Step 4.2: Confirm live preview**

Click **Select Template** on the Amber Classic card. You land on the biodata creation page with this template applied. In the right-hand live preview pane:
- Gold ornate corners at all 4 corners of the preview.
- Inner + outer gold rectangle (double-line look).
- Cream background tint (`#FFFAF0`).
- Faint dotted texture across the cream (low opacity gold dots on a 14px grid).
- **No** "Shree Ganeshay Namah" or "BIODATA" header text (those are gated to `template?.id === 'elegant-red'` at [Preview.tsx:281](../../../frontend/src/pages/Preview.tsx#L281),[290](../../../frontend/src/pages/Preview.tsx#L290),[297](../../../frontend/src/pages/Preview.tsx#L297) and exclude us by design).
- **No** "weddingbiodata.in" footer.
- **No** Om symbol.

Fill in a few sample fields (Name, Date of Birth) — confirm they appear inside the ornate frame and are fully legible against the dotted bg.

- [ ] **Step 4.3: Confirm custom-color picker still works**

If the create page exposes the border-color picker (it does, via the `customColor` flow in [Preview.tsx:179](../../../frontend/src/pages/Preview.tsx#L179)), pick a non-gold color (e.g. dark green). The SVG border + corner ornaments re-stroke to that color **live**. This proves the `${encodedColor}` substitution in Task 2's pattern is wired correctly.

Switch back to default; verify it returns to gold.

- [ ] **Step 4.4: Confirm the PDF download still works (no regression)**

Click **Preview & Download** (or whatever the next-step button is labeled). On the Preview page, click **Download PDF**. A `biodata_<FullName>.pdf` file downloads. It will look generic (no gold corners, no dotted bg) — **this is expected and in the spec's Out of Scope**.

- [ ] **Step 4.5: Sanity-check the other 15 templates didn't regress**

Go back to http://localhost:3000/templates. Switch among 2–3 other templates (Royal Red, Elegant Red, Modern Green). Confirm each still renders correctly in the live preview — borders, headers, colors all intact. Task 3's CSS appended only — it should not have side-effects.

---

## Done

When all checkboxes are checked, the work is complete. No commit step (per project rule — no git work).
