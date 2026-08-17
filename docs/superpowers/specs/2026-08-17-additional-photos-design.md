# Additional Photos (Up to 5) — Design

**Date:** 2026-08-17
**Author:** ysingh (with Claude)
**Reference:** [BioSample/Biodata - Prachi .pdf](../../../BioSample/Biodata%20-%20Prachi%20.pdf) — a competitor sample whose PDF bundles the main biodata page followed by extra full-body photo pages.

## Goal

Let users optionally upload up to 5 extra photos (in addition to the existing single profile photo shown inside the template). These extra photos are NOT part of the templated biodata design — they appear as plain, borderless photo pages appended after the main biodata page, both in the on-screen preview and in the downloaded PDF.

## Out of Scope

- Cropping or shape (rectangle/circle) selection for extra photos — uploaded and used as-is, full photo, no crop modal.
- Template border/background on extra photo pages — plain white page, just the photo.
- Reordering extra photos, drag-and-drop, or per-photo captions.
- Persisting extra photos across a browser refresh — same limitation the existing single profile photo already has (`File` objects aren't stored in the `localStorage` draft; they only survive via React Router navigation state between Create ↔ Download).
- Any change to the main biodata page's own layout, border, or PDF generation logic for that first page — it stays exactly as it is today.

## Data Flow

- New state in [CreateBiodataNew.tsx](../../../frontend/src/pages/CreateBiodataNew.tsx): `additionalPhotos: File[]`, capped at 5 entries.
- Passed through `navigate('/download', { state: { ..., additionalPhotos } })` exactly like the existing `photo` field, and read back out the same way in [Preview.tsx](../../../frontend/src/pages/Preview.tsx).
- Not included in the `localStorage` draft object (`Files` aren't JSON-serializable — matches how `photo` is already excluded).

## Form UI (CreateBiodataNew.tsx)

- New, separate section card titled "Additional Photos (Optional, up to 5)", placed after the existing "Upload Photo" section card.
- A single `<input type="file" multiple accept="image/*">`. On change, appended files are added to `additionalPhotos` up to the 5-photo cap; any files beyond the remaining capacity are silently ignored (no error dialog — the input simply stops accepting once full, and the section can show a small "5/5 photos added" style hint instead of an error).
- Uploaded photos render as a thumbnail grid (CSS grid, small square-ish thumbnails via `object-fit: cover`), each with a small × button that removes just that one photo from the array.
- No crop modal, no shape picker for this section.

## On-Screen Preview (both CreateBiodataNew.tsx mini preview and Preview.tsx download page)

- Below the existing bordered biodata box (inside the same scrollable container each file already uses), render one additional block per uploaded extra photo, stacked vertically in upload order.
- Each block: plain white background, no template border, `aspect-ratio: 210 / 297` (A4) container with the photo inside it via `object-fit: contain`, centered — matching proportions of the box above it so it visually reads as "the next page."
- This uses the existing scroll container in each file — no new scroll wrapper needed, since the container already scrolls to fit the (now taller) content.
- Implemented in both files independently (mirroring the project's existing pattern of duplicating preview-rendering logic between `CreateBiodataNew.tsx` and `Preview.tsx`), each reading its own local `additionalPhotos` state/prop.

## PDF Generation (Preview.tsx generatePDF())

- After the existing single-page logic finishes (border + background + content, unchanged), loop over `additionalPhotos`. For each one:
  - `doc.addPage()`
  - Load the photo as an `Image()`, await `.decode()`
  - Compute a centered, aspect-preserving fit within the new page (same fit-math pattern as the main content layer: whichever dimension is the tighter constraint determines the scale, centered on both axes) — this guarantees the photo never distorts or crops, just like the main page's text/photo layer.
  - `doc.addImage()` the photo onto the new page. No border, no background fill (plain white, jsPDF's default page background).
- Photos are added in the same order as `additionalPhotos` (upload order = page order in the final PDF).
- If `additionalPhotos` is empty, no extra pages are added — the PDF is unchanged from its current single-page output.

## Error Handling

- If an individual extra photo fails to load/decode during PDF generation, skip that one page (log to console) rather than failing the whole PDF — the main biodata page and any other successfully-loaded extra photos still generate normally.
