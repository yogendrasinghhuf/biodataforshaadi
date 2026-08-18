# Shared BiodataPage Component + Native PDF Text Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate the recurring PDF/preview position-drift bugs by (1) extracting one shared `BiodataPage` React component used by both the mini preview (`CreateBiodataNew.tsx`) and the download-page preview (`Preview.tsx`), so there is exactly one JSX/CSS layout instead of two hand-duplicated copies, and (2) rewriting PDF generation to draw native jsPDF text/shapes at fixed mm coordinates instead of rasterizing a DOM screenshot via `html2canvas`, so the PDF's field positions are set once, directly, instead of being derived from a captured image's variable aspect ratio.

**Architecture:** A new `BiodataPage.tsx` + `BiodataPage.css` pair renders the bordered biodata content (Ganesha icon, Shree Ganesh header, BIO DATA header, name, all field sections, photo corner, brand credit) from a single `formData`-shaped prop set. `CreateBiodataNew.tsx`'s mini preview and `Preview.tsx`'s download-page preview both render `<BiodataPage {...sharedProps} />` inside their own differently-sized containers — no `transform: scale()`, no size prop; the container's own CSS width (already set per-surface today) is what makes the mini box small and the download box large, exactly as today, because the component reuses the same relative/em-based sizing already in `biodata-preview-shared.css`. A parallel `pdf/renderBiodataPagePdf.ts` module contains a data-driven field list (the single source of truth for section order and labels, imported by `BiodataPage.tsx` too) and draws each field with `doc.text()` at computed mm coordinates, replacing `html2canvas` + `doc.addImage()` for the content layer. The border artwork keeps being rasterized from the same SVG-string generator and stretched full-page via `doc.addImage()` (unchanged — this part was never the bug). The profile photo is drawn via `doc.addImage()` at fixed mm coordinates matching the component's photo-corner position (unchanged technique, new fixed coordinates instead of DOM-measured ones).

**Tech Stack:** React 18 + TypeScript (Create React App), jsPDF 3.x (native `doc.text()`/`doc.addImage()`/`doc.setFont()`/`doc.setFontSize()`), existing CSS custom properties for template theming.

## Global Constraints

- CreateBiodataNew.tsx is extremely sensitive — every task touching it must diff the change and confirm it is minimal/isolated before moving on. Never rewrite unrelated code in this file.
- Never edit `mini-*` CSS/JSX and the plain-class CSS/JSX at the same time in one step — remove the `mini-*` duplication only after `BiodataPage` is proven working in both places.
- No backend/server changes. No new npm dependencies. No Puppeteer/Chromium — confirmed unnecessary; a real competitor PDF sample (`Producer: jsPDF 3.0.1`) proves native jsPDF text is the correct, already-proven-in-market approach.
- The on-screen mini preview and download preview must keep their current scrollable-content behavior (no fixed max-height added to the live DOM) — only the PDF's content layer is a fixed A4 page.
- All 16 templates' colors/border SVGs must render identically before and after — this is a structural refactor, not a redesign. No visual template changes are in scope.
- Additional-photo pages (up to 5 extra photos) must keep working exactly as today in both previews and the PDF.
- Run `CI=true npx tsc --noEmit` from `frontend/` after every task; it must produce no output before moving to the next task.

---

### Task 1: Extract field-list data model

**Files:**
- Create: `frontend/src/data/biodataFields.ts`

**Interfaces:**
- Produces: `FIELD_SECTIONS: FieldSection[]` where
  ```ts
  export interface FieldDef {
    key: string;        // formData property name, e.g. 'dateOfBirth'
    label: string;      // display label, e.g. 'Date of Birth:'
  }
  export interface FieldSection {
    title: string;       // e.g. 'Personal Details'
    fields: FieldDef[];
  }
  ```
- Consumed by Task 3 (`BiodataPage.tsx`) and Task 5 (`renderBiodataPagePdf.ts`) — both must import this file and iterate over it rather than hand-listing fields, so there is exactly one place that defines field order/labels/sections.

This task has no visual effect — it only extracts data that Task 3 will consume. It is checked by whether Task 3's rendered output matches today's exactly.

- [ ] **Step 1: Read the current field list from Preview.tsx**

Read `frontend/src/pages/Preview.tsx` lines 502-590 (the five sections: Personal Details, Religion Details, Family Information, Contact Information, Partner Preferences) and transcribe every field exactly, preserving order and exact label text (including trailing colons where present in the JSX, e.g. `"Date of Birth:"`).

- [ ] **Step 2: Write the data file**

```ts
export interface FieldDef {
  key: string;
  label: string;
}

export interface FieldSection {
  title: string;
  fields: FieldDef[];
}

export const FIELD_SECTIONS: FieldSection[] = [
  {
    title: 'Personal Details',
    fields: [
      { key: 'dateOfBirth', label: 'Date of Birth:' },
      { key: 'timeOfBirth', label: 'Time of Birth:' },
      { key: 'placeOfBirth', label: 'Place of Birth:' },
      { key: 'height', label: 'Height:' },
      { key: 'weight', label: 'Weight:' },
      { key: 'complexion', label: 'Complexion:' },
      { key: 'bloodGroup', label: 'Blood Group:' },
      { key: 'maritalStatus', label: 'Marital Status:' },
      { key: 'education', label: 'Education:' },
      { key: 'college', label: 'College/University:' },
      { key: 'occupation', label: 'Occupation:' },
      { key: 'company', label: 'Company:' },
      { key: 'annualIncome', label: 'Annual Income:' },
      { key: 'workLocation', label: 'Work Location:' },
    ],
  },
  {
    title: 'Religion Details',
    fields: [
      { key: 'caste', label: 'Caste:' },
      { key: 'subCaste', label: 'Sub-Caste:' },
      { key: 'gotra', label: 'Gotra:' },
      { key: 'rashi', label: 'Rashi:' },
      { key: 'nakshatra', label: 'Nakshatra:' },
      { key: 'manglik', label: 'Manglik:' },
      { key: 'deity', label: 'Kul Devta/Devi:' },
      { key: 'sect', label: 'Sect:' },
      { key: 'community', label: 'Community:' },
      { key: 'maslak', label: 'Maslak:' },
      { key: 'namazPractice', label: 'Namaz Practice:' },
      { key: 'hijab', label: 'Hijab/Purdah:' },
      { key: 'arabicName', label: 'Arabic Name:' },
      { key: 'denomination', label: 'Denomination:' },
      { key: 'churchAffiliation', label: 'Church:' },
      { key: 'baptized', label: 'Baptized:' },
      { key: 'sundayService', label: 'Church Attendance:' },
      { key: 'jatha', label: 'Jatha:' },
      { key: 'amritdhari', label: 'Amritdhari:' },
      { key: 'keshdhari', label: 'Keshdhari:' },
      { key: 'gurudwaraVisit', label: 'Gurudwara Visit:' },
    ],
  },
  {
    title: 'Family Information',
    fields: [
      { key: 'fatherName', label: "Father's Name:" },
      { key: 'fatherOccupation', label: "Father's Occupation:" },
      { key: 'motherName', label: "Mother's Name:" },
      { key: 'motherOccupation', label: "Mother's Occupation:" },
      { key: 'siblings', label: 'Siblings:' },
      { key: 'siblingsMarried', label: 'Siblings Married:' },
      { key: 'familyType', label: 'Family Type:' },
      { key: 'familyValues', label: 'Family Values:' },
      { key: 'familyIncome', label: 'Family Income:' },
      { key: 'nativePlace', label: 'Native Place:' },
      { key: 'currentAddress', label: 'Current Address:' },
    ],
  },
  {
    title: 'Contact Information',
    fields: [
      { key: 'phone', label: 'Phone:' },
      { key: 'email', label: 'Email:' },
      { key: 'whatsapp', label: 'Alternate No:' },
      { key: 'address', label: 'Address:' },
    ],
  },
  {
    title: 'Partner Preferences',
    fields: [
      { key: 'partnerAgeRange', label: 'Partner Age Range:' },
      { key: 'partnerHeight', label: 'Partner Height:' },
      { key: 'partnerEducation', label: 'Partner Education:' },
      { key: 'partnerOccupation', label: 'Partner Occupation:' },
      { key: 'partnerLocation', label: 'Partner Location:' },
      { key: 'otherPreferences', label: 'Other Preferences:' },
    ],
  },
];
```

- [ ] **Step 3: Type-check**

Run (from `frontend/`): `CI=true npx tsc --noEmit`
Expected: no output (this file isn't imported anywhere yet, so it only needs to compile standalone).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/data/biodataFields.ts
git commit -m "Extract biodata field/section list into shared data module"
```

---

### Task 2: Extract SVG border-pattern generator into a shared module

**Files:**
- Create: `frontend/src/data/borderPatterns.ts`
- Modify: `frontend/src/pages/Preview.tsx` (replace its local `generateBorderSVG` with an import)

**Interfaces:**
- Produces: `generateBorderSVG(color: string, templateId: string): string` — returns the exact same `url("data:image/svg+xml;base64,...")` string the current `Preview.tsx` copy produces (the "mini/thin" pattern set — NOT the `mini=true/false`-branching version in `CreateBiodataNew.tsx`, which is out of scope for this plan; `CreateBiodataNew.tsx` is not touched in this task).
- Consumed by: `Preview.tsx` (this task) and `BiodataPage.tsx` (Task 3) and `renderBiodataPagePdf.ts` (Task 5).

This task is a pure code-move with zero behavior change — every SVG string is copied byte-for-byte from `Preview.tsx`'s existing `generateBorderSVG` (lines 333-369 as currently written).

- [ ] **Step 1: Create the shared module**

Copy the entire `generateBorderSVG` function body from `frontend/src/pages/Preview.tsx` (the version with the `svgPatterns` object and `defaultPattern`, lines 333-369) verbatim into a new standalone exported function:

```ts
export const generateBorderSVG = (color: string, templateId: string): string => {
  const encodedColor = color;

  const svgPatterns: { [key: string]: string } = {
    // ... copy every entry verbatim from Preview.tsx's svgPatterns object ...
  };

  const defaultPattern = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g stroke='${encodedColor}' stroke-width='1' fill='none'><path d='M5,5 L60,5 M5,5 L5,60 M395,5 L340,5 M395,5 L395,60 M5,595 L60,595 M5,595 L5,540 M395,595 L340,595 M395,595 L395,540 M80,5 L320,5 M80,595 L320,595 M5,100 L5,500 M395,100 L395,500'/></g></svg>`;

  const svgPattern = templateId in svgPatterns ? svgPatterns[templateId] : defaultPattern;
  if (!svgPattern) {
    return 'none';
  }
  const sizedSvgPattern = svgPattern.replace('<svg ', "<svg width='400' height='600' ");
  return `url("data:image/svg+xml;base64,${btoa(sizedSvgPattern)}")`;
};
```

- [ ] **Step 2: Update Preview.tsx to import instead of defining locally**

In `frontend/src/pages/Preview.tsx`:
- Add import: `import { generateBorderSVG } from '../data/borderPatterns';`
- Delete the local `generateBorderSVG` function definition (the one currently at lines 333-369).
- Every call site in this file (`generateBorderSVG(effectiveColor, template?.id || 'elegant-red')`) stays textually identical — only the function's origin changes.

- [ ] **Step 3: Type-check and diff review**

Run: `CI=true npx tsc --noEmit` — expected: no output.

Run `git diff frontend/src/pages/Preview.tsx` and confirm the only changes are: one new import line, and the deleted function body. No call site's arguments changed.

- [ ] **Step 4: Manual visual check**

Start the frontend (`npm start` in `frontend/`), open `/create`, pick any template, fill a couple of fields, go to `/preview` (or wherever the download page route is) and confirm the border renders identically to before this change for at least 2 different templates.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/data/borderPatterns.ts frontend/src/pages/Preview.tsx
git commit -m "Extract border SVG pattern generator into shared module"
```

---

### Task 3: Build the shared BiodataPage component (structure + CSS, not yet wired in)

**Files:**
- Create: `frontend/src/components/BiodataPage.tsx`
- Create: `frontend/src/components/BiodataPage.css`

**Interfaces:**
- Consumes: `FIELD_SECTIONS` from Task 1's `frontend/src/data/biodataFields.ts`; `generateBorderSVG` from Task 2's `frontend/src/data/borderPatterns.ts`; `getIconSvg` from `frontend/src/data/godIcons.ts` (existing, unchanged).
- Produces:
  ```ts
  export interface BiodataPageProps {
    innerRef?: React.Ref<HTMLDivElement>;
    formData: Record<string, string>;
    templateId: string;
    effectiveColor: string;
    photo?: File | null;
    photoShape: 'rectangle' | 'circle';
    selectedSymbol?: string;
    showGaneshaIcon: boolean;
    showShreeGanesh: boolean;
    showBiodata: boolean;
    shreeGaneshText: string;
    biodataText: string;
    selectedGodIcon: string;
    additionalPhotos: File[];
    className?: string; // appended to the root element's className, so callers can add hide-shree-ganesh/hide-biodata/has-photo modifier classes exactly as today
  }
  export default function BiodataPage(props: BiodataPageProps): JSX.Element
  ```
  This component owns the JSX structure currently duplicated between `Preview.tsx` (lines 407-621) and `CreateBiodataNew.tsx`'s mini preview block (its `mini-*`-classed equivalent). It renders using the plain (non-`mini-`) class names already defined in `frontend/src/pages/biodata-preview-shared.css` (`biodata-preview-mini`, `preview-border-img`, `preview-inner-scroll`, `preview-mini-content-wrap`, `shree-ganesh-header`, `biodata-header`, `preview-name-title`, `preview-field`, `preview-section-label`, `preview-brand-credit`, `additional-photo-page`, etc.) — those class names and their CSS are NOT touched in this task; `BiodataPage.css` is additive/empty-shell only if a rule is missing, not a redefinition.
  - Not consumed by anything yet — this task only creates the component. Task 4 wires it into `Preview.tsx`. Task 6 wires it into `CreateBiodataNew.tsx`.

- [ ] **Step 1: Write BiodataPage.tsx**

```tsx
import React from 'react';
import { getIconSvg } from '../data/godIcons';
import { FIELD_SECTIONS } from '../data/biodataFields';
import { generateBorderSVG } from '../data/borderPatterns';
import './BiodataPage.css';

export interface BiodataPageProps {
  innerRef?: React.Ref<HTMLDivElement>;
  formData: Record<string, string>;
  templateId: string;
  templateBackground?: string;
  effectiveColor: string;
  photo?: File | null;
  photoShape: 'rectangle' | 'circle';
  selectedSymbol?: string;
  showGaneshaIcon: boolean;
  showShreeGanesh: boolean;
  showBiodata: boolean;
  shreeGaneshText: string;
  biodataText: string;
  selectedGodIcon: string;
  additionalPhotos: File[];
  className?: string;
}

const BiodataPage: React.FC<BiodataPageProps> = ({
  innerRef,
  formData,
  templateId,
  templateBackground,
  effectiveColor,
  photo,
  photoShape,
  selectedSymbol,
  showGaneshaIcon,
  showShreeGanesh,
  showBiodata,
  shreeGaneshText,
  biodataText,
  selectedGodIcon,
  additionalPhotos,
  className = '',
}) => {
  const anySectionHasData = (fields: { key: string }[]) =>
    fields.some((f) => formData[f.key]);

  return (
    <>
      <div
        ref={innerRef}
        className={`biodata-preview-mini mehndi-border border-template-${templateId || 'elegant-red'} ${!showShreeGanesh ? 'hide-shree-ganesh' : ''} ${!showBiodata ? 'hide-biodata' : ''} ${photo ? 'has-photo' : ''} ${className}`}
        style={{
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: templateBackground,
          ['--border-color' as any]: effectiveColor,
          ['--border-image' as any]: generateBorderSVG(effectiveColor, templateId || 'elegant-red'),
          ['--shree-ganesh-text' as any]: `"${shreeGaneshText}"`,
          ['--biodata-text' as any]: `"${biodataText}"`,
        }}
      >
        <img
          className="preview-border-img"
          src={generateBorderSVG(effectiveColor, templateId || 'elegant-red').replace(/^url\("/, '').replace(/"\)$/, '')}
          alt=""
          aria-hidden="true"
        />
        <div className="preview-inner-scroll">
          <div className="preview-mini-content-wrap">
            {showGaneshaIcon && selectedGodIcon && (
              <div
                className="ganesha-icon-header"
                dangerouslySetInnerHTML={{ __html: getIconSvg(selectedGodIcon) }}
              />
            )}

            {selectedSymbol && (
              <div className="symbol-watermark" style={{ color: effectiveColor }}>
                <span>{selectedSymbol}</span>
                <span>{selectedSymbol}</span>
                <span>{selectedSymbol}</span>
                <span>{selectedSymbol}</span>
              </div>
            )}

            {photo && (
              <div className={`preview-photo-corner photo-shape-${photoShape}`} style={{ borderColor: effectiveColor }}>
                <img src={URL.createObjectURL(photo)} alt="Profile" />
              </div>
            )}

            <div className="preview-mini-content">
              {showShreeGanesh && (
                <div className="shree-ganesh-header">
                  {showGaneshaIcon && (
                    <span
                      className="header-icon-left"
                      dangerouslySetInnerHTML={{ __html: getIconSvg(selectedGodIcon) }}
                    />
                  )}
                  <span className="shree-ganesh-text">{shreeGaneshText}</span>
                  {showGaneshaIcon && (
                    <span
                      className="header-icon-right"
                      dangerouslySetInnerHTML={{ __html: getIconSvg(selectedGodIcon) }}
                    />
                  )}
                </div>
              )}

              {!showShreeGanesh && showGaneshaIcon && (
                <div className="icon-only-header">
                  <span
                    className="icon-center"
                    dangerouslySetInnerHTML={{ __html: getIconSvg(selectedGodIcon) }}
                  />
                </div>
              )}

              {showBiodata && <div className="biodata-header">{biodataText}</div>}

              {formData.fullName && <h2 className="preview-name-title">{formData.fullName}</h2>}

              <div className="preview-fields-before-photo-clear">
                {FIELD_SECTIONS.slice(0, 2).map((section) => (
                  <React.Fragment key={section.title}>
                    {anySectionHasData(section.fields) && (
                      <div className="preview-section-label" style={{ color: effectiveColor }}>
                        {section.title}
                      </div>
                    )}
                    {section.fields.map(
                      (field) =>
                        formData[field.key] && (
                          <div className="preview-field" key={field.key}>
                            <strong>{field.label}</strong>
                            <span>{formData[field.key]}</span>
                          </div>
                        )
                    )}
                  </React.Fragment>
                ))}
              </div>

              {FIELD_SECTIONS.slice(2).map((section) => (
                <React.Fragment key={section.title}>
                  {anySectionHasData(section.fields) && (
                    <div className="preview-section-label" style={{ color: effectiveColor }}>
                      {section.title}
                    </div>
                  )}
                  {section.fields.map(
                    (field) =>
                      formData[field.key] && (
                        <div className="preview-field" key={field.key}>
                          <strong>{field.label}</strong>
                          <span>{formData[field.key]}</span>
                        </div>
                      )
                  )}
                </React.Fragment>
              ))}

              {Object.keys(formData).length === 0 && !photo && (
                <div className="preview-empty">
                  <p>Start filling the form to see your biodata preview here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="preview-brand-credit" style={{ color: effectiveColor }}>
          biodataforshaadi.com
        </div>
      </div>

      {additionalPhotos.map((file, index) => (
        <div key={index} className="additional-photo-page">
          <img
            className="additional-photo-page-border"
            src={generateBorderSVG(effectiveColor, templateId || 'elegant-red').replace(/^url\("/, '').replace(/"\)$/, '')}
            alt=""
            aria-hidden="true"
          />
          <img className="additional-photo-page-img" src={URL.createObjectURL(file)} alt={`Additional photo ${index + 1}`} />
        </div>
      ))}
    </>
  );
};

export default BiodataPage;
```

Note on `FIELD_SECTIONS.slice(0, 2)` / `.slice(2)`: this reproduces the existing structural quirk where only the first two sections (Personal Details, Religion Details) are wrapped in `.preview-fields-before-photo-clear` (so the photo-clearance `min-height` CSS rule applies to them specifically) while the remaining three sections render after that wrapper closes. This must stay index-based on section order, matching today's hand-written JSX exactly — do not reorder `FIELD_SECTIONS` in Task 1 without revisiting this split.

- [ ] **Step 2: Write BiodataPage.css (empty shell, since all needed rules already live in biodata-preview-shared.css)**

```css
/* BiodataPage-specific overrides go here if ever needed.
   All layout/typography rules for this component currently live in
   frontend/src/pages/biodata-preview-shared.css, imported by both
   CreateBiodataNew.tsx and Preview.tsx. Do not duplicate rules from
   there into this file. */
```

- [ ] **Step 3: Type-check**

Run: `CI=true npx tsc --noEmit`
Expected: no output. (Component isn't rendered anywhere yet, so this only checks its own types compile — pay attention to any prop-type mismatch against `godIcons`/`biodataFields`/`borderPatterns` exports.)

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/BiodataPage.tsx frontend/src/components/BiodataPage.css
git commit -m "Add shared BiodataPage component (not yet wired into any page)"
```

---

### Task 4: Wire BiodataPage into Preview.tsx's on-screen preview (PDF generation untouched)

**Files:**
- Modify: `frontend/src/pages/Preview.tsx`

**Interfaces:**
- Consumes: `BiodataPage` from Task 3 (`frontend/src/components/BiodataPage.tsx`).
- Produces: no new exports; `Preview.tsx`'s rendered on-screen preview markup changes to `<BiodataPage />`, but its visible output must be pixel-identical to before.

This task deliberately does NOT touch `generatePDF()` — swapping the on-screen JSX and fixing PDF generation are separate concerns; mixing them in one task makes any resulting bug ambiguous about which change caused it.

- [ ] **Step 1: Replace the inline JSX block with BiodataPage**

In `frontend/src/pages/Preview.tsx`, replace the entire block from `<div ref={previewRef} className={\`biodata-preview-mini ...\`}>` through its matching closing `</div> {/* biodata-preview-mini */}` AND the following additional-photos `.map(...)` block (i.e., everything currently inside `<div className="preview-scroll-wrapper">` except the wrapper div itself) with:

```tsx
<BiodataPage
  innerRef={previewRef}
  formData={formData}
  templateId={template?.id || 'elegant-red'}
  templateBackground={template?.colors.background}
  effectiveColor={effectiveColor}
  photo={photo}
  photoShape={photoShape}
  selectedSymbol={selectedSymbol}
  showGaneshaIcon={showGaneshaIcon}
  showShreeGanesh={showShreeGanesh}
  showBiodata={showBiodata}
  shreeGaneshText={shreeGaneshText}
  biodataText={biodataText}
  selectedGodIcon={selectedGodIcon}
  additionalPhotos={additionalPhotos}
/>
```

Add the import: `import BiodataPage from '../components/BiodataPage';`

Delete the now-unused local `generateBorderSVG` references inside the JSX that Task 2 already removed the function definition for — Task 2 should have left zero remaining call sites in the deleted block; if any call site referencing `generateBorderSVG` remains elsewhere in `Preview.tsx` after this deletion (e.g. nowhere — the only caller was inside the deleted JSX), remove the Task 2 import too if it becomes unused. Verify with `tsc` (unused-import is not a `tsc --noEmit` error by default, so also visually check the top of the file).

- [ ] **Step 2: Type-check**

Run: `CI=true npx tsc --noEmit` — expected: no output.

- [ ] **Step 3: Manual visual regression check**

Start the frontend. For at least 3 different templates (pick one from the dark-royal group like `sapphire-classic`, one plain like `elegant-red`, and one with a distinctive border like `luxury-gold`):
1. Fill in a short biodata (2-3 fields) and view `/preview` — compare against a screenshot taken before this task's change (or against `git stash` of the previous version if easier) for: border rendering, Shree Ganesh/BIO DATA position, photo position (with a photo uploaded), brand credit line position, additional-photo pages if any uploaded.
2. Fill in a long biodata (every field) and repeat the same checks.
3. Confirm the scrollbar in `.preview-scroll-wrapper` still works for long content.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/Preview.tsx
git commit -m "Wire Preview.tsx's on-screen preview through shared BiodataPage component"
```

---

### Task 5: Rewrite generatePDF() to draw native text/positions instead of html2canvas capture

**Files:**
- Create: `frontend/src/pdf/renderBiodataPagePdf.ts`
- Modify: `frontend/src/pages/Preview.tsx` (replace `generatePDF()`'s body; keep its name/signature so `handleDownloadPDF` is unchanged)

**Interfaces:**
- Consumes: `FIELD_SECTIONS` from Task 1; `generateBorderSVG` from Task 2; `jsPDF` (existing dependency).
- Produces:
  ```ts
  export interface BiodataPdfInput {
    formData: Record<string, string>;
    templateId: string;
    templateBackground: string;
    effectiveColor: string;
    photoDataUrl?: string;       // pre-loaded photo as a data URL, or undefined
    photoShape: 'rectangle' | 'circle';
    showGaneshaIcon: boolean;
    showShreeGanesh: boolean;
    showBiodata: boolean;
    shreeGaneshText: string;
    biodataText: string;
    godIconSvg?: string;          // pre-fetched via getIconSvg(selectedGodIcon), or undefined
    additionalPhotoDataUrls: string[]; // one per additional photo, pre-loaded
  }
  export async function renderBiodataPagePdf(doc: jsPDF, input: BiodataPdfInput): Promise<void>
  ```
  `renderBiodataPagePdf` draws directly onto the provided `doc` (assumes `doc` is already a fresh single-page `jsPDF({unit: 'mm', format: 'a4'})` for the main page; it calls `doc.addPage()` itself for each additional photo). `Preview.tsx`'s `generatePDF()` becomes a thin wrapper: build the `BiodataPdfInput` (loading the photo/god-icon/additional-photo files into data URLs first, reusing the existing `new Image()` + canvas re-encode pattern already proven in the current code for format-normalizing uploaded photos), construct the `jsPDF` instance, and call `renderBiodataPagePdf(doc, input)`.

**Fixed layout constants (the actual fix for the drift bug — every position below is a constant, not derived from any measured DOM/canvas size):**

```ts
const PAGE_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;
const CONTENT_LEFT_MM = 18;
const CONTENT_RIGHT_MM = 18;
const CONTENT_TOP_MM = 22;          // top of Shree Ganesh header — fixed, matches the on-screen preview's padding-top region visually
const PHOTO_WIDTH_MM = 32;
const PHOTO_HEIGHT_MM = 42.7;       // 3:4 ratio, matches --photo-corner's 128x170.7px CSS ratio
const PHOTO_RIGHT_MM = 14;
const PHOTO_TOP_MM = 40;
const BRAND_CREDIT_BOTTOM_MM = 12;  // fixed distance from page bottom — never derived from content height
const LABEL_COL_WIDTH_MM = 46;      // strong/label column width, mirrors preview-field strong's 155px at mini-preview's ~650px width scale
const LINE_HEIGHT_MM = 5.2;
const SECTION_GAP_MM = 4;
```

- [ ] **Step 1: Write renderBiodataPagePdf.ts — page background, border, header**

```ts
import { jsPDF } from 'jspdf';
import { FIELD_SECTIONS } from '../data/biodataFields';
import { generateBorderSVG } from '../data/borderPatterns';

export interface BiodataPdfInput {
  formData: Record<string, string>;
  templateId: string;
  templateBackground: string;
  effectiveColor: string;
  photoDataUrl?: string;
  photoShape: 'rectangle' | 'circle';
  showGaneshaIcon: boolean;
  showShreeGanesh: boolean;
  showBiodata: boolean;
  shreeGaneshText: string;
  biodataText: string;
  additionalPhotoDataUrls: string[];
}

const PAGE_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;
const CONTENT_LEFT_MM = 18;
const CONTENT_RIGHT_MM = 18;
const CONTENT_TOP_MM = 22;
const PHOTO_WIDTH_MM = 32;
const PHOTO_HEIGHT_MM = 42.7;
const PHOTO_RIGHT_MM = 14;
const PHOTO_TOP_MM = 40;
const BRAND_CREDIT_BOTTOM_MM = 12;
const LABEL_COL_WIDTH_MM = 46;
const LINE_HEIGHT_MM = 5.2;
const SECTION_GAP_MM = 4;

async function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('image failed to load for PDF'));
    img.src = src;
  });
  await img.decode();
  return img;
}

async function drawBorderFullPage(doc: jsPDF, effectiveColor: string, templateId: string): Promise<void> {
  const svgUrl = generateBorderSVG(effectiveColor, templateId).replace(/^url\("/, '').replace(/"\)$/, '');
  const borderImg = await loadImage(svgUrl);
  const mmToPx = 12;
  const canvas = document.createElement('canvas');
  canvas.width = PAGE_WIDTH_MM * mmToPx;
  canvas.height = PAGE_HEIGHT_MM * mmToPx;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.drawImage(borderImg, 0, 0, canvas.width, canvas.height);
    doc.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, PAGE_WIDTH_MM, PAGE_HEIGHT_MM);
  }
}

function drawPhoto(
  doc: jsPDF,
  photoImg: HTMLImageElement,
  photoShape: 'rectangle' | 'circle',
  effectiveColor: string
): void {
  const x = PAGE_WIDTH_MM - CONTENT_RIGHT_MM - PHOTO_RIGHT_MM - PHOTO_WIDTH_MM;
  const y = PHOTO_TOP_MM;
  const w = PHOTO_WIDTH_MM;
  const h = photoShape === 'circle' ? PHOTO_WIDTH_MM : PHOTO_HEIGHT_MM;

  // Crop the source image to the frame's aspect ratio (matches CSS object-fit: cover, object-position: top center).
  const srcAspect = photoImg.naturalWidth / photoImg.naturalHeight;
  const destAspect = w / h;
  let sx = 0, sy = 0, sw = photoImg.naturalWidth, sh = photoImg.naturalHeight;
  if (srcAspect > destAspect) {
    sw = photoImg.naturalHeight * destAspect;
    sx = (photoImg.naturalWidth - sw) / 2;
  } else {
    sh = photoImg.naturalWidth / destAspect;
    sy = 0;
  }
  const cropCanvas = document.createElement('canvas');
  const cropScale = 4; // supersample for print quality
  cropCanvas.width = w * cropScale * 3.7795; // mm to px at ~96dpi*cropScale headroom
  cropCanvas.height = h * cropScale * 3.7795;
  const cropCtx = cropCanvas.getContext('2d');
  if (!cropCtx) return;
  cropCtx.drawImage(photoImg, sx, sy, sw, sh, 0, 0, cropCanvas.width, cropCanvas.height);
  doc.addImage(cropCanvas.toDataURL('image/png'), 'PNG', x, y, w, h);

  doc.setDrawColor(effectiveColor);
  doc.setLineWidth(0.8);
  if (photoShape === 'circle') {
    doc.circle(x + w / 2, y + h / 2, w / 2, 'S');
  } else {
    doc.roundedRect(x, y, w, h, 2, 2, 'S');
  }
}

export async function renderBiodataPagePdf(doc: jsPDF, input: BiodataPdfInput): Promise<void> {
  doc.setFillColor(input.templateBackground || '#ffffff');
  doc.rect(0, 0, PAGE_WIDTH_MM, PAGE_HEIGHT_MM, 'F');

  await drawBorderFullPage(doc, input.effectiveColor, input.templateId);

  let cursorY = CONTENT_TOP_MM;
  const centerX = PAGE_WIDTH_MM / 2;

  if (input.showShreeGanesh) {
    doc.setFont('times', 'italic');
    doc.setFontSize(13);
    doc.setTextColor(input.effectiveColor === input.templateBackground ? '#333333' : '#333333');
    doc.text(input.shreeGaneshText, centerX, cursorY, { align: 'center' });
    cursorY += 7;
  }

  if (input.showBiodata) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor('#000000');
    doc.text(input.biodataText.toUpperCase(), centerX, cursorY, { align: 'center' });
    cursorY += 8;
  }

  if (input.formData.fullName) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor('#000000');
    doc.text(input.formData.fullName, centerX, cursorY, { align: 'center' });
    cursorY += 9;
  }

  if (input.photoDataUrl) {
    const photoImg = await loadImage(input.photoDataUrl);
    drawPhoto(doc, photoImg, input.photoShape, input.effectiveColor);
  }

  const fieldStartX = CONTENT_LEFT_MM;
  const fieldMaxWidth = PAGE_WIDTH_MM - CONTENT_LEFT_MM - CONTENT_RIGHT_MM;

  for (const section of FIELD_SECTIONS) {
    const hasData = section.fields.some((f) => input.formData[f.key]);
    if (!hasData) continue;

    cursorY += SECTION_GAP_MM;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(input.effectiveColor);
    doc.text(section.title.toUpperCase(), fieldStartX, cursorY);
    cursorY += LINE_HEIGHT_MM;

    for (const field of section.fields) {
      const value = input.formData[field.key];
      if (!value) continue;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor('#333333');
      doc.text(field.label, fieldStartX, cursorY);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor('#000000');
      const valueLines = doc.splitTextToSize(value, fieldMaxWidth - LABEL_COL_WIDTH_MM);
      doc.text(valueLines, fieldStartX + LABEL_COL_WIDTH_MM, cursorY);
      cursorY += LINE_HEIGHT_MM * Math.max(1, valueLines.length);
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(input.effectiveColor);
  doc.text('biodataforshaadi.com', centerX, PAGE_HEIGHT_MM - BRAND_CREDIT_BOTTOM_MM, { align: 'center' });

  for (const photoDataUrl of input.additionalPhotoDataUrls) {
    doc.addPage();
    doc.setFillColor('#ffffff');
    doc.rect(0, 0, PAGE_WIDTH_MM, PAGE_HEIGHT_MM, 'F');
    await drawBorderFullPage(doc, input.effectiveColor, input.templateId);

    const img = await loadImage(photoDataUrl);
    const photoScale = 0.8;
    const photoAspect = img.naturalWidth / img.naturalHeight;
    const pageAspect = PAGE_WIDTH_MM / PAGE_HEIGHT_MM;
    let pw: number, ph: number;
    if (photoAspect > pageAspect) {
      pw = PAGE_WIDTH_MM * photoScale;
      ph = pw / photoAspect;
    } else {
      ph = PAGE_HEIGHT_MM * photoScale;
      pw = ph * photoAspect;
    }
    doc.addImage(photoDataUrl, 'PNG', (PAGE_WIDTH_MM - pw) / 2, (PAGE_HEIGHT_MM - ph) / 2, pw, ph);
  }
}
```

Note on the Shree Ganesh/BIO DATA/name font choices, sizes, and exact Y-spacing constants above (13pt italic serif, 11pt bold sans, 14pt bold, +7/+8/+9mm line advances): these are starting values chosen to visually approximate the current on-screen proportions, not values transcribed from a spec. Step 4 (visual comparison) is where these get tuned — treat every numeric constant in this file as adjustable during that step, not as fixed requirements.

- [ ] **Step 2: Rewrite generatePDF() in Preview.tsx to call the new renderer**

Replace the entire body of `generatePDF()` (currently lines 43-317) with:

```tsx
const generatePDF = async () => {
  if (!previewRef.current) return null;

  const loadPhotoAsDataUrl = async (file: File): Promise<string> => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    try {
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('photo failed to load'));
        img.src = objectUrl;
      });
      await img.decode();
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      return canvas.toDataURL('image/png');
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  };

  const photoDataUrl = photo ? await loadPhotoAsDataUrl(photo) : undefined;
  const additionalPhotoDataUrls: string[] = [];
  for (const file of additionalPhotos) {
    try {
      additionalPhotoDataUrls.push(await loadPhotoAsDataUrl(file));
    } catch (error) {
      console.error('Skipping an additional photo page:', error);
    }
  }

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  await renderBiodataPagePdf(doc, {
    formData,
    templateId: template?.id || 'elegant-red',
    templateBackground: template?.colors.background || '#ffffff',
    effectiveColor,
    photoDataUrl,
    photoShape,
    showGaneshaIcon,
    showShreeGanesh,
    showBiodata,
    shreeGaneshText,
    biodataText,
    additionalPhotoDataUrls,
  });

  return doc;
};
```

Add the import: `import { renderBiodataPagePdf } from '../pdf/renderBiodataPagePdf';`

Remove the now-unused `html2canvas` import if `generatePDF()` was its only caller in this file (check for other usages first — `grep html2canvas frontend/src/pages/Preview.tsx`).

- [ ] **Step 3: Type-check**

Run: `CI=true npx tsc --noEmit` — expected: no output.

- [ ] **Step 4: Visual comparison + constant tuning pass**

Download a PDF for each of these cases and visually compare against the on-screen preview (from Task 4) at the same content:
1. Short content (2-3 fields, no photo) — confirm Shree Ganesh/BIO DATA/name sit at a reasonable position near the top border, matching roughly where they sit on-screen.
2. Full content (every field filled) — confirm no field overlaps another, text doesn't run past the bottom border in the common case, and the brand credit line sits above the bottom border.
3. With a profile photo (both rectangle and circle shape) — confirm the photo sits in the same visual corner as the on-screen preview, correctly cropped, with the border-colored frame.
4. With 2-3 additional photos — confirm each gets its own bordered page with the photo centered.
5. At least 3 different templates (one dark-royal like `sapphire-classic`, one plain, one with a distinctive border pattern) — confirm border renders correctly and text colors are legible against each background.

Adjust the constants at the top of `renderBiodataPagePdf.ts` (`CONTENT_TOP_MM`, `PHOTO_TOP_MM`, `LINE_HEIGHT_MM`, font sizes, etc.) as needed until the PDF looks visually right and self-consistent across all content lengths — this is expected iteration, not a sign of a wrong implementation. Because every position is now a constant instead of derived from a captured image, this tuning is a one-time cost: once these constants look right, they stay right regardless of how much content the user fills in, which is the entire point of this plan.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pdf/renderBiodataPagePdf.ts frontend/src/pages/Preview.tsx
git commit -m "Replace html2canvas PDF capture with native jsPDF text rendering"
```

---

### Task 6: Wire BiodataPage into CreateBiodataNew.tsx's mini preview

**Files:**
- Modify: `frontend/src/pages/CreateBiodataNew.tsx`

**Interfaces:**
- Consumes: `BiodataPage` from Task 3.
- Produces: no new exports; the mini preview's rendered markup changes to `<BiodataPage />`, output must be visually equivalent (small-box-sized) to before.

This is the highest-risk task in the plan given `CreateBiodataNew.tsx`'s sensitivity. Follow the extra precautions below exactly.

- [ ] **Step 1: Back up the file before touching it**

```bash
cp frontend/src/pages/CreateBiodataNew.tsx frontend/src/pages/CreateBiodataNew.tsx.backup-before-biodatapage
```

- [ ] **Step 2: Identify the exact block to replace**

Read `frontend/src/pages/CreateBiodataNew.tsx` lines 860-1075 (approximate — locate the precise start/end by finding the opening `<div ref={previewRef} className={\`mini-biodata-preview-mini ...\`}>` and its matching closing `</div>{/* end mini-biodata-preview-mini */}`, plus the immediately-following `additionalPhotos.map(...)` block that renders `mini-additional-photo-page` elements). Confirm this block's props/state references (`formData`, `template`, `effectiveColor`, `photo`, `photoShape`, `selectedSymbol`, `showGaneshaIcon`, `showShreeGanesh`, `showBiodata`, `shreeGaneshText`, `biodataText`, `selectedGodIcon`, `additionalPhotos`) — these should be the same variable names already in scope in this component (verify each one exists in `CreateBiodataNew.tsx`'s state/props before writing the replacement, since a subtly different variable name here would silently pass `undefined`).

- [ ] **Step 3: Replace the block**

Replace the entire identified block with:

```tsx
<BiodataPage
  innerRef={previewRef}
  formData={formData}
  templateId={template?.id || 'elegant-red'}
  templateBackground={template?.colors.background}
  effectiveColor={effectiveColor}
  photo={photo}
  photoShape={photoShape}
  selectedSymbol={selectedSymbol}
  showGaneshaIcon={showGaneshaIcon}
  showShreeGanesh={showShreeGanesh}
  showBiodata={showBiodata}
  shreeGaneshText={shreeGaneshText}
  biodataText={biodataText}
  selectedGodIcon={selectedGodIcon}
  additionalPhotos={additionalPhotos}
/>
```

Add the import: `import BiodataPage from '../components/BiodataPage';`

Do not touch anything else in this file in this step — no unrelated formatting changes, no touching the form fields above/below this block.

- [ ] **Step 4: Diff review before proceeding**

Run `git diff frontend/src/pages/CreateBiodataNew.tsx` and confirm:
- Exactly one new import line added.
- The replaced block's line count shrank from ~215 lines to ~17 lines, with no other hunks anywhere else in the file.
- No form-handling logic (state setters, `onChange` handlers, validation) appears in the diff.

If the diff shows any change outside the mini-preview block, stop and revert using the backup file — do not proceed until the diff is isolated to exactly this block.

- [ ] **Step 5: Type-check**

Run: `CI=true npx tsc --noEmit` — expected: no output.

- [ ] **Step 6: Manual visual regression check on the mini preview specifically**

Start the frontend, open `/create`, and for at least 3 templates (dark-royal, plain, distinctive-border) with both short and full-length content:
- Confirm the mini preview box still renders at its expected small size (unchanged from before this task).
- Confirm Shree Ganesh/BIO DATA/name/photo/fields/brand-credit line all appear correctly positioned within the small box, matching the visual layout from before this task (compare against the `.backup-before-biodatapage` file's rendering if unsure, e.g. by temporarily `git stash`-ing this task's change).
- Confirm editing form fields live-updates the mini preview exactly as before (no new re-render bugs).
- Confirm additional-photo thumbnails still appear as separate stacked pages below the main mini preview.

- [ ] **Step 7: Remove the backup file and commit**

```bash
rm frontend/src/pages/CreateBiodataNew.tsx.backup-before-biodatapage
git add frontend/src/pages/CreateBiodataNew.tsx
git commit -m "Wire CreateBiodataNew.tsx's mini preview through shared BiodataPage component"
```

---

### Task 7: Delete the now-dead duplicated mini-* CSS and any leftover mini-* JSX remnants

**Files:**
- Modify: `frontend/src/pages/CreateBiodataNew.css` (delete ~108 `mini-*`-prefixed rule blocks)
- Modify: `frontend/src/pages/CreateBiodataNew.tsx` (delete the now-unused local `generateBorderSVG`'s `mini` parameter branch IF nothing else in the file still calls it with `mini=true` — see Step 1)

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing new — this is pure dead-code removal, verified safe only after Task 6 is confirmed working.

This task must run LAST, only after Task 6's visual regression check has passed — deleting `mini-*` CSS before confirming `BiodataPage` fully replaced its usage would break the mini preview with no easy rollback signal.

- [ ] **Step 1: Confirm mini-* classes are truly unreferenced**

Run: `grep -n "mini-biodata-preview-mini\|mini-mehndi-border\|mini-hide-shree-ganesh\|mini-hide-biodata\|mini-has-photo\|mini-additional-photo-page\|mini-preview-brand-credit" frontend/src/pages/CreateBiodataNew.tsx`

Expected: no matches (Task 6 already removed the only JSX that used these class names). If any match remains, investigate and resolve it before proceeding — do not delete the CSS while JSX still references it.

Separately, check whether `generateBorderSVG`'s `mini` parameter (in `CreateBiodataNew.tsx`) is still called with `mini=true` anywhere outside the deleted block (e.g. a template gallery/thumbnail feature elsewhere in this file may legitimately use the "gallery" pattern set via `mini=false`, which is unrelated to this plan and must NOT be touched). Run: `grep -n "generateBorderSVG(" frontend/src/pages/CreateBiodataNew.tsx` and inspect each remaining call site's third argument. Only remove the `mini` branch/parameter if literally zero call sites pass `true` after Task 6's edit — otherwise leave `generateBorderSVG` and its `mini` parameter untouched (it's serving an unrelated feature, out of scope).

- [ ] **Step 2: Delete the dead CSS rules**

In `frontend/src/pages/CreateBiodataNew.css`, delete every rule block whose selector starts with `.mini-` or targets a `.mini-`-prefixed class (the 108 occurrences found via `grep -c "^\.mini-" frontend/src/pages/CreateBiodataNew.css` during planning). Use `grep -n "^\.mini-\|\.mini-"` to enumerate exact line ranges before deleting, and delete in one pass reviewing the surrounding context isn't shared with any still-used selector (some rules may be comma-separated lists mixing `.mini-*` and other classes — in that case, remove only the `.mini-*` selector from the list, not the whole rule, if the other selector is still in use).

- [ ] **Step 3: Type-check and build**

Run: `CI=true npx tsc --noEmit` — expected: no output.
Run: `npm run build` (from `frontend/`) — expected: build succeeds with no new warnings about missing classes (CSS isn't type-checked, so this is a sanity build, not a guarantee — Step 4's visual check is the real gate).

- [ ] **Step 4: Full visual regression check**

Repeat Task 6 Step 6's checklist (mini preview, 3 templates, short/full content) one more time to confirm removing the CSS caused no visual regression.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/CreateBiodataNew.css frontend/src/pages/CreateBiodataNew.tsx
git commit -m "Remove dead mini-* CSS/JSX now that CreateBiodataNew uses shared BiodataPage"
```

---

## Post-plan note (not a task — informational only)

After this plan, the on-screen mini preview and download-page preview are guaranteed identical (same component), and the PDF's field positions are fixed constants independent of content length or template — the specific class of bug this plan was written to eliminate (biodataforshaadi.com / Shree Ganesh / BIO DATA drifting based on how much the form was filled in) cannot recur, because there is no image-capture-and-fit step left in the PDF path to drift. Any future visual tweak to a fixed constant in `renderBiodataPagePdf.ts` should be cross-checked against `BiodataPage.css`/`biodata-preview-shared.css` if it's meant to also change the on-screen preview, since those remain two independent representations of the same design (one is CSS, one is jsPDF drawing calls) — this plan does not unify them into one, it only unifies the two on-screen previews with each other and fixes the PDF's positioning bug independently.
