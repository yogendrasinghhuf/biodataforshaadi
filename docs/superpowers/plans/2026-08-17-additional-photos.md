# Additional Photos (Up to 5) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users optionally upload up to 5 extra photos beyond the main profile photo. They appear as bordered-but-plain-white pages after the main biodata page, in both on-screen previews and the downloaded PDF.

**Architecture:** New `additionalPhotos: File[]` state flows from `CreateBiodataNew.tsx` through React Router navigation `state` into `Preview.tsx`, exactly like the existing single `photo` field does today. Each of the two files independently renders its own JSX blocks for the extra photos (matching this project's existing pattern of duplicating preview-rendering logic between the two files) and reuses that file's own existing `generateBorderSVG()` copy for the border. `Preview.tsx`'s `generatePDF()` appends one `doc.addPage()` per extra photo, reusing the existing border-rasterization code.

**Tech Stack:** React 19 + TypeScript, `jsPDF`, `html2canvas` (frontend only — no backend changes).

## Global Constraints

- No test framework exists in this project. Verification after every step is: `cd frontend && CI=true npx tsc --noEmit` (must show zero output = clean), plus an explicit manual visual check described in the step.
- `frontend/src/pages/CreateBiodataNew.tsx` is a sensitive, previously-flagged-as-fragile file ("took months to create, don't fuck this up" — standing user instruction). Every task touching it must diff cleanly against a fresh backup copied before edits, and the diff must be minimal/isolated to just the intended lines.
- `File` objects (photos) are never persisted to the `localStorage` draft — only via React Router navigation `state`. This matches the existing single `photo` field's behavior exactly; do not add new persistence.
- Extra photo pages: white background (jsPDF default / no `doc.setFillColor` call for these pages), template border only — never the template's background color.
- No cropping, no shape (rectangle/circle) picker for extra photos — used as uploaded, always `object-fit: contain` / aspect-preserving fit.
- Cap is exactly 5 extra photos. Selecting more than the remaining capacity silently truncates to fill the remaining slots (no error dialog).

---

## Task 1: Add `additionalPhotos` state and upload UI to CreateBiodataNew.tsx

**Files:**
- Modify: `frontend/src/pages/CreateBiodataNew.tsx:57` (near existing `photo` state), and `frontend/src/pages/CreateBiodataNew.tsx:678-748` (Photo Upload section — new card goes right after this one, before line 750's Submit Button)
- Modify: `frontend/src/pages/CreateBiodataNew.css` (new styles for the thumbnail grid)

**Interfaces:**
- Produces: `additionalPhotos: File[]` state (max length 5), `setAdditionalPhotos: React.Dispatch<React.SetStateAction<File[]>>` — consumed by Task 2 (mini preview), Task 4 (navigate to Preview), and read back from `location.state.additionalPhotos` on mount (matching how `photo` is read at line 57).

- [ ] **Step 1: Back up the file before any edits**

```bash
cp "c:/MarriageBiodata/frontend/src/pages/CreateBiodataNew.tsx" "c:/MarriageBiodata/frontend/src/pages/CreateBiodataNew.tsx.task1.bak"
```

- [ ] **Step 2: Add the `additionalPhotos` state**

In `CreateBiodataNew.tsx`, immediately after the existing line:
```tsx
const [photo, setPhoto] = useState<File | null>(savedState.photo || null);
```
add:
```tsx
const [additionalPhotos, setAdditionalPhotos] = useState<File[]>(savedState.additionalPhotos || []);
```

- [ ] **Step 3: Add the upload handler**

Near the existing `handlePhotoUpload` function (around line 115), add a new handler:
```tsx
const handleAdditionalPhotosUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!e.target.files) return;
  const newFiles = Array.from(e.target.files);
  setAdditionalPhotos(prev => [...prev, ...newFiles].slice(0, 5));
  e.target.value = '';
};

const handleRemoveAdditionalPhoto = (index: number) => {
  setAdditionalPhotos(prev => prev.filter((_, i) => i !== index));
};
```

- [ ] **Step 4: Add the new form section card**

In the JSX, immediately after the closing `</div>` of the "Photo Upload" section card (the line right before `{/* Submit Button */}`, i.e. right after line 748's `</div>`), insert:

```tsx
{/* Additional Photos (Optional) */}
<div className="form-section-card">
  <h2 className="section-heading">
    <span className="section-icon">🖼️</span>
    Additional Photos (Optional, up to 5)
  </h2>
  <div className="additional-photos-upload">
    <input
      type="file"
      accept="image/*"
      multiple
      onChange={handleAdditionalPhotosUpload}
      className="photo-input"
      id="additional-photos-upload"
      disabled={additionalPhotos.length >= 5}
    />
    <label
      htmlFor="additional-photos-upload"
      className={`photo-upload-label ${additionalPhotos.length >= 5 ? 'photo-upload-label-disabled' : ''}`}
    >
      <div className="photo-placeholder-small">
        <span className="photo-icon">🖼️</span>
        <span>{additionalPhotos.length >= 5 ? '5/5 photos added' : 'Click to add photos'}</span>
      </div>
    </label>
    {additionalPhotos.length > 0 && (
      <div className="additional-photos-grid">
        {additionalPhotos.map((file, index) => (
          <div key={index} className="additional-photo-thumb">
            <img src={URL.createObjectURL(file)} alt={`Additional ${index + 1}`} />
            <button
              type="button"
              className="additional-photo-remove"
              onClick={() => handleRemoveAdditionalPhoto(index)}
              aria-label={`Remove photo ${index + 1}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
</div>
```

- [ ] **Step 5: Add CSS for the thumbnail grid**

In `CreateBiodataNew.css`, add (near the existing `.photo-upload-compact` rules — search for that class to find the right spot):

```css
.additional-photos-upload {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.photo-upload-label-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.additional-photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
}

.additional-photo-thumb {
  position: relative;
  aspect-ratio: 1;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--gray-200);
}

.additional-photo-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.additional-photo-remove {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.additional-photo-remove:hover {
  background: rgba(220, 38, 38, 0.9);
}
```

- [ ] **Step 6: Type-check**

Run: `cd c:/MarriageBiodata/frontend && CI=true npx tsc --noEmit`
Expected: no output (clean).

- [ ] **Step 7: Diff check against backup**

Run: `diff c:/MarriageBiodata/frontend/src/pages/CreateBiodataNew.tsx.task1.bak c:/MarriageBiodata/frontend/src/pages/CreateBiodataNew.tsx`
Expected: only the lines added in Steps 2-4 appear as additions; nothing else changed.

- [ ] **Step 8: Manual visual check**

Start the dev server if not already running (`cd c:/MarriageBiodata/frontend && BROWSER=none npm start`), open the Create Biodata page, scroll to below the existing Photo Upload section, and confirm:
- A new "Additional Photos (Optional, up to 5)" card appears
- Clicking it opens a file picker that allows multi-select
- After selecting photos, thumbnails appear in a grid with × remove buttons
- Uploading a 6th photo when 5 are already present has no effect (input is disabled, label reads "5/5 photos added")
- Clicking × on a thumbnail removes just that one photo

- [ ] **Step 9: Remove backup and commit**

```bash
rm "c:/MarriageBiodata/frontend/src/pages/CreateBiodataNew.tsx.task1.bak"
cd c:/MarriageBiodata && git add frontend/src/pages/CreateBiodataNew.tsx frontend/src/pages/CreateBiodataNew.css
git commit -m "Add additional photos upload UI to Create Biodata form"
```

---

## Task 2: Render additional photos as extra pages in CreateBiodataNew.tsx's mini preview

**Files:**
- Modify: `frontend/src/pages/CreateBiodataNew.tsx:994-995` (insert new blocks between the closing `mini-biodata-preview-mini` div and the closing `preview-scroll-wrapper` div)
- Modify: `frontend/src/pages/CreateBiodataNew.css` (new styles for the extra-page blocks)

**Interfaces:**
- Consumes: `additionalPhotos: File[]` (from Task 1), `generateBorderSVG(effectiveColor, template?.id || 'elegant-red', true)` (existing function at `CreateBiodataNew.tsx:357`), `effectiveColor` (existing computed value in this file).
- Produces: nothing new consumed elsewhere — this is a leaf rendering task.

- [ ] **Step 1: Back up the file before any edits**

```bash
cp "c:/MarriageBiodata/frontend/src/pages/CreateBiodataNew.tsx" "c:/MarriageBiodata/frontend/src/pages/CreateBiodataNew.tsx.task2.bak"
```

- [ ] **Step 2: Insert the extra-page blocks**

Find this exact existing code (currently at lines 992-995):
```tsx
              {/* Pinned to the box's own bottom edge, matching the download page and PDF */}
              <div className="mini-preview-brand-credit" style={{ color: effectiveColor }}>biodataforshaadi.com</div>
            </div>{/* end mini-biodata-preview-mini */}
            </div>{/* end preview-scroll-wrapper */}
```

Replace it with (adding the new block between the two closing divs):
```tsx
              {/* Pinned to the box's own bottom edge, matching the download page and PDF */}
              <div className="mini-preview-brand-credit" style={{ color: effectiveColor }}>biodataforshaadi.com</div>
            </div>{/* end mini-biodata-preview-mini */}

            {/* Additional photo pages — plain white background, template border only, no fields */}
            {additionalPhotos.map((file, index) => (
              <div key={index} className="mini-additional-photo-page">
                <img
                  className="mini-additional-photo-page-border"
                  src={generateBorderSVG(effectiveColor, template?.id || 'elegant-red', true).replace(/^url\("/, '').replace(/"\)$/, '')}
                  alt=""
                  aria-hidden="true"
                />
                <img
                  className="mini-additional-photo-page-img"
                  src={URL.createObjectURL(file)}
                  alt={`Additional photo ${index + 1}`}
                />
              </div>
            ))}
            </div>{/* end preview-scroll-wrapper */}
```

- [ ] **Step 3: Add CSS for the extra-page blocks**

In `CreateBiodataNew.css`, add (near the existing `.mini-biodata-preview-mini` / `.mini-preview-border-img` rules):

```css
.mini-additional-photo-page {
  position: relative;
  width: 100%;
  aspect-ratio: 210 / 297;
  background: #ffffff;
  margin-top: 12px;
  overflow: hidden;
}

.mini-additional-photo-page-border {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  object-fit: fill;
  pointer-events: none;
}

.mini-additional-photo-page-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  object-fit: contain;
}
```

- [ ] **Step 4: Type-check**

Run: `cd c:/MarriageBiodata/frontend && CI=true npx tsc --noEmit`
Expected: no output (clean).

- [ ] **Step 5: Diff check against backup**

Run: `diff c:/MarriageBiodata/frontend/src/pages/CreateBiodataNew.tsx.task2.bak c:/MarriageBiodata/frontend/src/pages/CreateBiodataNew.tsx`
Expected: only the block added in Step 2 appears as an addition.

- [ ] **Step 6: Manual visual check**

On the Create Biodata page, upload 2-3 additional photos via the section from Task 1. Scroll the mini preview box (on the right) down past the main biodata content. Confirm:
- Each additional photo appears as its own white, A4-proportioned block below the main bordered box
- Each block has the same template border/color as the main box
- The photo is fully visible (not cropped) inside its block, centered
- Scrolling works smoothly using the existing preview scrollbar (no new/broken scroll behavior)

- [ ] **Step 7: Remove backup and commit**

```bash
rm "c:/MarriageBiodata/frontend/src/pages/CreateBiodataNew.tsx.task2.bak"
cd c:/MarriageBiodata && git add frontend/src/pages/CreateBiodataNew.tsx frontend/src/pages/CreateBiodataNew.css
git commit -m "Show additional photos as extra bordered pages in mini preview"
```

---

## Task 3: Pass additionalPhotos through navigation state (both directions)

**Files:**
- Modify: `frontend/src/pages/CreateBiodataNew.tsx` (the `handleSubmit` function's `navigate('/download', ...)` call)
- Modify: `frontend/src/pages/Preview.tsx` (the `location.state` destructure at the top, and the `handleBack` function's `navigate('/create', ...)` call)

**Interfaces:**
- Consumes: `additionalPhotos: File[]` from Task 1 (in `CreateBiodataNew.tsx`).
- Produces: `additionalPhotos: File[]` available as a destructured variable in `Preview.tsx`, consumed by Task 4 (preview rendering) and Task 5 (PDF generation).

- [ ] **Step 1: Back up both files**

```bash
cp "c:/MarriageBiodata/frontend/src/pages/CreateBiodataNew.tsx" "c:/MarriageBiodata/frontend/src/pages/CreateBiodataNew.tsx.task3.bak"
cp "c:/MarriageBiodata/frontend/src/pages/Preview.tsx" "c:/MarriageBiodata/frontend/src/pages/Preview.tsx.task3.bak"
```

- [ ] **Step 2: Add `additionalPhotos` to the forward navigation**

In `CreateBiodataNew.tsx`, find the `handleSubmit` function's `navigate('/download', { state: { ... } })` call (currently listing `formData, religion, photo, templateId, customColor, selectedSymbol, showGaneshaIcon, showShreeGanesh, showBiodata, shreeGaneshText, biodataText, selectedGodIcon, photoShape`). Add `additionalPhotos` to that object:

```tsx
    navigate('/download', {
      state: {
        formData,
        religion,
        photo,
        additionalPhotos,
        templateId: selectedTemplate,
        customColor,
        selectedSymbol,
        showGaneshaIcon,
        showShreeGanesh,
        showBiodata,
        shreeGaneshText,
        biodataText,
        selectedGodIcon,
        photoShape
      }
    });
```

- [ ] **Step 3: Read `additionalPhotos` in Preview.tsx**

In `Preview.tsx`, find the line:
```tsx
const { formData, religion, photo, templateId, customColor, selectedSymbol, showGaneshaIcon = true, showShreeGanesh = true, showBiodata = true, shreeGaneshText = '|| Shree Ganeshay Namah ||', biodataText = 'BIODATA', selectedGodIcon = 'om', photoShape = 'rectangle' } = location.state || {};
```
Replace with (adding `additionalPhotos = []` with a default empty array, since older navigation states or direct loads won't have it):
```tsx
const { formData, religion, photo, additionalPhotos = [], templateId, customColor, selectedSymbol, showGaneshaIcon = true, showShreeGanesh = true, showBiodata = true, shreeGaneshText = '|| Shree Ganeshay Namah ||', biodataText = 'BIODATA', selectedGodIcon = 'om', photoShape = 'rectangle' } = location.state || {};
```

- [ ] **Step 4: Add `additionalPhotos` to the back navigation**

In `Preview.tsx`, find the `handleBack` function:
```tsx
const handleBack = () => {
  navigate('/create', {
    state: {
      formData,
      religion,
      photo,
      templateId: template?.id,
      customColor,
      selectedSymbol
    }
  });
};
```
Add `additionalPhotos`:
```tsx
const handleBack = () => {
  navigate('/create', {
    state: {
      formData,
      religion,
      photo,
      additionalPhotos,
      templateId: template?.id,
      customColor,
      selectedSymbol
    }
  });
};
```

- [ ] **Step 5: Type-check**

Run: `cd c:/MarriageBiodata/frontend && CI=true npx tsc --noEmit`
Expected: no output (clean).

- [ ] **Step 6: Diff check against backups**

```bash
diff c:/MarriageBiodata/frontend/src/pages/CreateBiodataNew.tsx.task3.bak c:/MarriageBiodata/frontend/src/pages/CreateBiodataNew.tsx
diff c:/MarriageBiodata/frontend/src/pages/Preview.tsx.task3.bak c:/MarriageBiodata/frontend/src/pages/Preview.tsx
```
Expected: only the `additionalPhotos` additions from Steps 2-4 appear; nothing else changed.

- [ ] **Step 7: Manual visual check**

On the Create Biodata page, upload 2 additional photos, fill in required fields (Full Name, DOB, Phone), click "Preview & Download". Confirm the Download page loads without errors (check browser console for none). Click "← Back to Edit" and confirm the additional photos thumbnails from Task 1 are still present in the form (round-trip worked).

- [ ] **Step 8: Remove backups and commit**

```bash
rm "c:/MarriageBiodata/frontend/src/pages/CreateBiodataNew.tsx.task3.bak" "c:/MarriageBiodata/frontend/src/pages/Preview.tsx.task3.bak"
cd c:/MarriageBiodata && git add frontend/src/pages/CreateBiodataNew.tsx frontend/src/pages/Preview.tsx
git commit -m "Pass additionalPhotos through navigation state between Create and Download pages"
```

---

## Task 4: Render additional photos as extra pages in Preview.tsx's on-screen preview

**Files:**
- Modify: `frontend/src/pages/Preview.tsx` (insert new blocks between the closing `biodata-preview-mini` div and the closing `preview-scroll-wrapper` div, currently at lines 510-511)
- Modify: `frontend/src/pages/Preview.css` (new styles for the extra-page blocks)

**Interfaces:**
- Consumes: `additionalPhotos: File[]` (from Task 3), `generateBorderSVG(effectiveColor, template?.id || 'elegant-red')` (existing function at `Preview.tsx:241`), `effectiveColor` (existing computed value in this file).
- Produces: nothing new consumed elsewhere — leaf rendering task.

- [ ] **Step 1: Back up the file**

```bash
cp "c:/MarriageBiodata/frontend/src/pages/Preview.tsx" "c:/MarriageBiodata/frontend/src/pages/Preview.tsx.task4.bak"
```

- [ ] **Step 2: Insert the extra-page blocks**

Find this exact existing code (currently at lines 509-511):
```tsx
            <div className="preview-brand-credit" style={{ color: effectiveColor }}>biodataforshaadi.com</div>
          </div> {/* biodata-preview-mini */}
          </div> {/* preview-scroll-wrapper */}
```

Replace with:
```tsx
            <div className="preview-brand-credit" style={{ color: effectiveColor }}>biodataforshaadi.com</div>
          </div> {/* biodata-preview-mini */}

          {/* Additional photo pages — plain white background, template border only, no fields */}
          {additionalPhotos.map((file: File, index: number) => (
            <div key={index} className="additional-photo-page">
              <img
                className="additional-photo-page-border"
                src={generateBorderSVG(effectiveColor, template?.id || 'elegant-red').replace(/^url\("/, '').replace(/"\)$/, '')}
                alt=""
                aria-hidden="true"
              />
              <img
                className="additional-photo-page-img"
                src={URL.createObjectURL(file)}
                alt={`Additional photo ${index + 1}`}
              />
            </div>
          ))}
          </div> {/* preview-scroll-wrapper */}
```

- [ ] **Step 3: Add CSS for the extra-page blocks**

In `Preview.css`, add (near the existing `.preview-scroll-wrapper` / `.biodata-preview-mini` rules):

```css
.preview-layout .additional-photo-page {
  position: relative;
  width: 100%;
  aspect-ratio: 210 / 297;
  background: #ffffff;
  margin-top: 16px;
  overflow: hidden;
}

.preview-layout .additional-photo-page-border {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  object-fit: fill;
  pointer-events: none;
}

.preview-layout .additional-photo-page-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  object-fit: contain;
}
```

- [ ] **Step 4: Type-check**

Run: `cd c:/MarriageBiodata/frontend && CI=true npx tsc --noEmit`
Expected: no output (clean).

- [ ] **Step 5: Diff check against backup**

Run: `diff c:/MarriageBiodata/frontend/src/pages/Preview.tsx.task4.bak c:/MarriageBiodata/frontend/src/pages/Preview.tsx`
Expected: only the block added in Step 2 appears as an addition.

- [ ] **Step 6: Manual visual check**

Go through Create Biodata with 2-3 additional photos uploaded, click through to the Download page. Scroll the (larger) preview box down past the main biodata content. Confirm the same visual result as Task 2's check, but in this bigger box: white A4-proportioned blocks, template border, photo centered and uncropped, smooth scrolling.

- [ ] **Step 7: Remove backup and commit**

```bash
rm "c:/MarriageBiodata/frontend/src/pages/Preview.tsx.task4.bak"
cd c:/MarriageBiodata && git add frontend/src/pages/Preview.tsx frontend/src/pages/Preview.css
git commit -m "Show additional photos as extra bordered pages in Download page preview"
```

---

## Task 5: Append additional photos as extra PDF pages

**Files:**
- Modify: `frontend/src/pages/Preview.tsx` (the `generatePDF()` function, specifically the section after the existing single-page content is drawn, currently ending at `return doc;` around line 224)

**Interfaces:**
- Consumes: `additionalPhotos: File[]` (from Task 3), `borderImgEl` (existing local variable inside `generatePDF()`, an `HTMLImageElement | undefined` sourced from `.preview-border-img`), `pageWidthMm`/`pageHeightMm` (existing local constants, both `210`/`297`), `doc` (existing local `jsPDF` instance).
- Produces: nothing new consumed elsewhere — this is the final step in the PDF pipeline before `return doc;`.

- [ ] **Step 1: Back up the file**

```bash
cp "c:/MarriageBiodata/frontend/src/pages/Preview.tsx" "c:/MarriageBiodata/frontend/src/pages/Preview.tsx.task5.bak"
```

- [ ] **Step 2: Add the extra-pages loop**

Find this exact existing code (the end of `generatePDF()`):
```tsx
    doc.setFontSize(10);
    doc.setTextColor(effectiveColor);
    doc.text('biodataforshaadi.com', pageWidthMm / 2, pageHeightMm - 12, { align: 'center' });

    return doc;
  };
```

Replace with (inserting the new loop before `return doc;`):
```tsx
    doc.setFontSize(10);
    doc.setTextColor(effectiveColor);
    doc.text('biodataforshaadi.com', pageWidthMm / 2, pageHeightMm - 12, { align: 'center' });

    // Additional photo pages — each gets its own page: the same template border rasterized
    // fresh (reusing the exact rasterization step used for the main page above), on a plain
    // white background, with the photo centered inside at its own true aspect ratio so it's
    // never distorted or cropped, matching the main page's text/photo layer.
    for (const photoFile of additionalPhotos) {
      doc.addPage();

      if (borderImgEl?.src) {
        const pageBorderSourceImg = new Image();
        await new Promise<void>((resolve, reject) => {
          pageBorderSourceImg.onload = () => resolve();
          pageBorderSourceImg.onerror = () => reject(new Error('border image failed to load for additional photo page'));
          pageBorderSourceImg.src = borderImgEl.src;
        });
        await pageBorderSourceImg.decode();

        const mmToPx = 12;
        const pageBorderCanvas = document.createElement('canvas');
        pageBorderCanvas.width = pageWidthMm * mmToPx;
        pageBorderCanvas.height = pageHeightMm * mmToPx;
        const pageBorderCtx = pageBorderCanvas.getContext('2d');
        if (pageBorderCtx) {
          pageBorderCtx.drawImage(pageBorderSourceImg, 0, 0, pageBorderCanvas.width, pageBorderCanvas.height);
          doc.addImage(pageBorderCanvas.toDataURL('image/png'), 'PNG', 0, 0, pageWidthMm, pageHeightMm);
        }
      }

      try {
        const extraPhotoImg = new Image();
        const extraPhotoUrl = URL.createObjectURL(photoFile);
        await new Promise<void>((resolve, reject) => {
          extraPhotoImg.onload = () => resolve();
          extraPhotoImg.onerror = () => reject(new Error('additional photo failed to load'));
          extraPhotoImg.src = extraPhotoUrl;
        });
        await extraPhotoImg.decode();

        // Drawn onto an intermediate canvas and passed to jsPDF as a data URL — matching the
        // exact pattern already proven for the border and main content above. jsPDF's addImage
        // expects a data URL/base64 string (not a raw Image element), and uploaded photos can be
        // PNG/WEBP/etc, not reliably JPEG, so re-encoding via canvas.toDataURL avoids a format
        // mismatch with the fixed 'JPEG' string a raw Image call would otherwise require.
        const extraPhotoCanvas = document.createElement('canvas');
        extraPhotoCanvas.width = extraPhotoImg.naturalWidth;
        extraPhotoCanvas.height = extraPhotoImg.naturalHeight;
        const extraPhotoCtx = extraPhotoCanvas.getContext('2d');
        if (extraPhotoCtx) {
          extraPhotoCtx.drawImage(extraPhotoImg, 0, 0);

          const photoAspect = extraPhotoImg.naturalWidth / extraPhotoImg.naturalHeight;
          const pageAspectForPhoto = pageWidthMm / pageHeightMm;
          let photoWidthMm: number;
          let photoHeightMm: number;
          if (photoAspect > pageAspectForPhoto) {
            photoWidthMm = pageWidthMm;
            photoHeightMm = photoWidthMm / photoAspect;
          } else {
            photoHeightMm = pageHeightMm;
            photoWidthMm = photoHeightMm * photoAspect;
          }
          const photoXOffset = (pageWidthMm - photoWidthMm) / 2;
          const photoYOffset = (pageHeightMm - photoHeightMm) / 2;

          doc.addImage(extraPhotoCanvas.toDataURL('image/png'), 'PNG', photoXOffset, photoYOffset, photoWidthMm, photoHeightMm);
        }
        URL.revokeObjectURL(extraPhotoUrl);
      } catch (error) {
        console.error('Skipping an additional photo page:', error);
      }
    }

    return doc;
  };
```

- [ ] **Step 3: Type-check**

Run: `cd c:/MarriageBiodata/frontend && CI=true npx tsc --noEmit`
Expected: no output (clean).

- [ ] **Step 4: Diff check against backup**

Run: `diff c:/MarriageBiodata/frontend/src/pages/Preview.tsx.task5.bak c:/MarriageBiodata/frontend/src/pages/Preview.tsx`
Expected: only the loop added in Step 2 appears as an addition.

- [ ] **Step 5: Manual visual check — with additional photos**

On the Create Biodata page, fill required fields, upload 1 main profile photo and 3 additional photos, click through to Download, click "Pay & Download PDF". Open the downloaded PDF and confirm:
- Page 1 is the main biodata page, completely unchanged from before this feature (border, background, text, photo, credit line all in their existing correct positions — compare against a PDF downloaded before this task if unsure)
- Pages 2, 3, 4 each show one of the 3 additional photos, in upload order
- Each additional-photo page has the same template border color/pattern as page 1
- Each additional-photo page's background is white, not the template's background color
- Each photo is fully visible, not cropped or stretched, centered on its page

- [ ] **Step 6: Manual visual check — without additional photos**

Repeat the same flow but with zero additional photos uploaded. Download the PDF and confirm it is exactly one page (no empty extra pages added).

- [ ] **Step 7: Remove backup and commit**

```bash
rm "c:/MarriageBiodata/frontend/src/pages/Preview.tsx.task5.bak"
cd c:/MarriageBiodata && git add frontend/src/pages/Preview.tsx
git commit -m "Append additional photos as extra bordered pages in the downloaded PDF"
```

---

## Task 6: Clear additional photos on form reset

**Files:**
- Modify: `frontend/src/pages/CreateBiodataNew.tsx` (the `handleClearForm` function)

**Interfaces:**
- Consumes: `setAdditionalPhotos` (from Task 1).
- Produces: nothing new.

- [ ] **Step 1: Back up the file**

```bash
cp "c:/MarriageBiodata/frontend/src/pages/CreateBiodataNew.tsx" "c:/MarriageBiodata/frontend/src/pages/CreateBiodataNew.tsx.task6.bak"
```

- [ ] **Step 2: Add the reset call**

In `handleClearForm`, find:
```tsx
      setPhoto(null);
```
Add immediately after it:
```tsx
      setPhoto(null);
      setAdditionalPhotos([]);
```

- [ ] **Step 3: Type-check**

Run: `cd c:/MarriageBiodata/frontend && CI=true npx tsc --noEmit`
Expected: no output (clean).

- [ ] **Step 4: Diff check against backup**

Run: `diff c:/MarriageBiodata/frontend/src/pages/CreateBiodataNew.tsx.task6.bak c:/MarriageBiodata/frontend/src/pages/CreateBiodataNew.tsx`
Expected: only the one line added in Step 2.

- [ ] **Step 5: Manual visual check**

Upload 2 additional photos, click "Clear Form" and confirm the confirmation dialog appears; confirm it. Verify the additional photos thumbnail grid is now empty and the upload section shows its default "Click to add photos" state.

- [ ] **Step 6: Remove backup and commit**

```bash
rm "c:/MarriageBiodata/frontend/src/pages/CreateBiodataNew.tsx.task6.bak"
cd c:/MarriageBiodata && git add frontend/src/pages/CreateBiodataNew.tsx
git commit -m "Clear additional photos when the form is reset"
```
