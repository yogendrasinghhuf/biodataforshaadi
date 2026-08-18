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
  godIconSvg?: string;
  additionalPhotoDataUrls: string[];
}

/* ============================================================================
   Layout constants.

   THE POINT OF THIS FILE: every position below is a fixed constant. Nothing is
   derived from a measured DOM rect or a captured canvas's aspect ratio, so the
   header, photo and brand-credit land on the exact same millimetre coordinate
   whether the user filled in three fields or forty. That is the drift bug this
   module exists to kill.

   These are not arbitrary. They are converted from the real CSS in
   pages/biodata-preview-shared.css + pages/Preview.css using the on-screen
   preview box's own scale:

     the preview box is 650px wide (.preview-layout .preview-scroll-wrapper's
     max-width) and represents a 210mm-wide A4 page, so

       PX_TO_MM = 210 / 650 = 0.3231 mm per CSS px
       PX_TO_PT = 0.3231mm / 25.4 * 72 = 0.9161 pt per CSS px

   Each constant below cites the CSS declaration it came from, so a future
   tweak to the on-screen preview has an obvious counterpart here.
   ========================================================================= */

const PAGE_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;

/** 210 / 650 — the preview box's px-to-mm scale. */
const PX_TO_MM = PAGE_WIDTH_MM / 650;
/** Same scale expressed in PDF points (jsPDF's setFontSize unit). */
const PX_TO_PT = (PX_TO_MM / 25.4) * 72;

/** .preview-mini-content-wrap padding: 16px 40px 40px -> 40px side padding. */
const CONTENT_LEFT_MM = 40 * PX_TO_MM; // 12.9
const CONTENT_RIGHT_MM = 40 * PX_TO_MM; // 12.9

/**
 * Baseline of the first header line. The content wrap starts 16px below the box
 * top, and the shree-ganesh header adds 6px of its own padding-top; a ~11.5px
 * glyph then sits on a baseline roughly its own cap-height lower. 16+6+10 = 32px
 * -> 10.3mm, plus the 20px (6.5mm) of extra top clearance the old PDF path
 * deliberately added via `pdfTopSpacingAdditionPx` so the header never kisses
 * the top border. Kept because that clearance was a real, user-reported fix.
 */
const CONTENT_TOP_MM = 32 * PX_TO_MM + 20 * PX_TO_MM; // 16.8

/** .preview-photo-corner width: 128px. */
const PHOTO_WIDTH_MM = 128 * PX_TO_MM; // 41.3
/** .preview-photo-corner height: 170.7px (the 3:4 rectangle the uploader crops to). */
const PHOTO_HEIGHT_MM = 170.7 * PX_TO_MM; // 55.1
/**
 * .preview-photo-corner right: 44px, measured from the content wrap's padding
 * box, which is itself inset 40px. So the gap from the page edge is 84px, i.e.
 * CONTENT_RIGHT_MM (40px) + 44px. This constant is that extra 44px.
 */
const PHOTO_RIGHT_MM = 44 * PX_TO_MM; // 14.2
/**
 * .preview-photo-corner top: 145px, measured from the box top, plus the same
 * 20px PDF top clearance applied to the header so the photo moves with the
 * content instead of drifting away from it.
 */
const PHOTO_TOP_MM = (145 + 20) * PX_TO_MM; // 53.3
/** .preview-photo-corner border: 3px solid currentColor. */
const PHOTO_BORDER_MM = 3 * PX_TO_MM; // 0.97
/** .preview-photo-corner border-radius: 8px. */
const PHOTO_RADIUS_MM = 8 * PX_TO_MM; // 2.6

/** .preview-brand-credit bottom: 26px — a fixed inset from the page bottom. */
const BRAND_CREDIT_BOTTOM_MM = 26 * PX_TO_MM; // 8.4

/**
 * Lowest baseline body text may occupy before it must break to a new page: the
 * credit line's own position plus clearance for its cap height and the border
 * artwork below it. The on-screen preview is an ever-growing scrollable box and
 * simply lets long content run on, but a PDF page has a hard edge — without
 * this, a fully-filled biodata's last sections printed on top of the credit
 * line and then off the paper entirely.
 */
const CONTENT_BOTTOM_LIMIT_MM = PAGE_HEIGHT_MM - BRAND_CREDIT_BOTTOM_MM - 8; // ~280.6

/** .preview-field strong { flex: 0 0 155px } — the label column's fixed width. */
const LABEL_COL_WIDTH_MM = 155 * PX_TO_MM; // 50.1
/** .preview-field padding: 3px 6px — the 6px horizontal inset on each row. */
const FIELD_ROW_INSET_MM = 6 * PX_TO_MM; // 1.9

/**
 * One field row: 11px font x 1.4 line-height = 15.4px, plus .preview-field's
 * 3px top + 3px bottom padding = 21.4px.
 */
const LINE_HEIGHT_MM = 21.4 * PX_TO_MM; // 6.9
/** Wrapped continuation lines get the line box only, not the row padding again. */
const WRAP_LINE_HEIGHT_MM = 15.4 * PX_TO_MM; // 5.0

/**
 * .preview-section-label: margin-top 11px + padding 9px top / 4px bottom, and
 * its own ~12.8px line. Split into the gap above the label and the advance
 * below it.
 */
const SECTION_GAP_MM = (11 + 9) * PX_TO_MM; // 6.5
const SECTION_LABEL_ADVANCE_MM = (12.8 + 4 + 2) * PX_TO_MM; // 6.1
/** .preview-section-label padding-left: 9px. */
const SECTION_LABEL_INSET_MM = 9 * PX_TO_MM; // 2.9

/* Font sizes, converted from the CSS px sizes at PX_TO_PT. */
/** .shree-ganesh-text font-size: 0.72rem = 11.52px. */
const SHREE_GANESH_PT = 11.52 * PX_TO_PT; // 10.6
/** .biodata-header font-size: 0.67rem = 10.72px. */
const BIODATA_PT = 10.72 * PX_TO_PT; // 9.8
/** .preview-name-title font-size: 0.8rem = 12.8px. */
const NAME_PT = 12.8 * PX_TO_PT; // 11.7
/** .preview-section-label font-size: 0.8rem = 12.8px. */
const SECTION_LABEL_PT = 12.8 * PX_TO_PT; // 11.7
/** .preview-field / strong / span font-size: 11px. */
const FIELD_PT = 11 * PX_TO_PT; // 10.1
/** .preview-brand-credit font-size: 0.75rem = 12px. */
const BRAND_CREDIT_PT = 12 * PX_TO_PT; // 11.0

/* Vertical advances after each header block, from the CSS box model. */
/** .shree-ganesh-header padding 6px top / 3px bottom around an ~11.5px line. */
const SHREE_GANESH_ADVANCE_MM = (11.52 * 1.4 + 3) * PX_TO_MM; // 6.2
/** .biodata-header padding-bottom: 6px around an ~10.7px line. */
const BIODATA_ADVANCE_MM = (10.72 * 1.4 + 6) * PX_TO_MM; // 6.8
/** .preview-name-title: 12.8px line + padding 12/6 + margin-bottom 6px. */
const NAME_ADVANCE_MM = (12.8 * 1.4 + 6 + 6) * PX_TO_MM; // 9.7
/** .icon-center / .header-icon-* are 29px square. */
const GOD_ICON_SIZE_MM = 29 * PX_TO_MM; // 9.4
/** Gap between the god icons and the Shree Ganesh text (.shree-ganesh-header gap: 18px). */
const GOD_ICON_GAP_MM = 18 * PX_TO_MM; // 5.8

/**
 * .has-photo .preview-fields-before-photo-clear { min-height: 210px } — the
 * first two sections reserve at least the photo's height so Family Information
 * onwards starts below the photo instead of running behind it.
 */
const PHOTO_CLEAR_MIN_HEIGHT_MM = 210 * PX_TO_MM; // 67.8
/** .has-photo .preview-fields-before-photo-clear .preview-field { padding-right: 180px } */
const PHOTO_FIELD_DODGE_MM = 180 * PX_TO_MM; // 58.2

/**
 * Rasterisation density for the profile photo: 12 px/mm is ~305 DPI, i.e. print
 * quality for the one element whose detail actually matters.
 */
const RASTER_PX_PER_MM = 12;

/**
 * The border SVGs are authored on a 400x600 viewBox of thin strokes. Rasterising
 * them at the photo's density would mean a 2520x3564 (9 megapixel) canvas per
 * page to represent a handful of hairlines — slow to encode and large to embed,
 * for no visible gain once the PDF scales the result back down. 3x the authored
 * size keeps the strokes smooth on a 210mm page at a fraction of the cost.
 */
const BORDER_RASTER_SCALE = 3;
const BORDER_RASTER_WIDTH = 400 * BORDER_RASTER_SCALE;
const BORDER_RASTER_HEIGHT = 600 * BORDER_RASTER_SCALE;

/** Templates whose dark background needs the light/gold type from the shared CSS. */
const DARK_ROYAL_TEMPLATES = new Set([
  'sapphire-classic',
  'crimson-rose',
  'peacock-green',
  'amber-classic',
  'royal-mandala',
]);

/** Mirrors the dark-royal colour overrides in biodata-preview-shared.css. */
interface PaletteColors {
  shreeGanesh: string;
  biodata: string;
  name: string;
  label: string;
  value: string;
  sectionLabel: string;
}

function palette(templateId: string, effectiveColor: string): PaletteColors {
  if (DARK_ROYAL_TEMPLATES.has(templateId)) {
    return {
      shreeGanesh: '#E8C77A',
      biodata: '#FFFFFF',
      name: '#FFFFFF',
      label: '#E8C77A',
      value: '#EDE3CC',
      sectionLabel: '#E8C77A',
    };
  }
  return {
    shreeGanesh: '#333333',
    biodata: '#000000',
    name: '#000000',
    label: '#374151',
    value: '#111827',
    sectionLabel: effectiveColor,
  };
}

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

/**
 * Rasterises an SVG source string to a PNG data URL at the given mm box size.
 * jsPDF cannot embed an SVG data URI directly, and addImage requires a
 * data-URL/base64 string — never a raw Image element — so everything drawn here
 * goes through a canvas first.
 */
async function svgToPngDataUrl(svgUrl: string, pixelWidth: number, pixelHeight: number): Promise<string | null> {
  const img = await loadImage(svgUrl);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(pixelWidth);
  canvas.height = Math.round(pixelHeight);
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/png');
}

/**
 * Draws the template's border artwork stretched over the whole page, exactly as
 * the previous html2canvas path did: same generateBorderSVG source, same
 * url("...") unwrapping, same full-bleed stretch. Reused unchanged for every one
 * of the 16 templates and for the additional-photo pages, so no template's
 * border rendering changes as a result of this rewrite.
 */
async function drawBorderFullPage(doc: jsPDF, effectiveColor: string, templateId: string): Promise<void> {
  const svgUrl = generateBorderSVG(effectiveColor, templateId)
    .replace(/^url\("/, '')
    .replace(/"\)$/, '');
  if (svgUrl === 'none') return;
  const pngDataUrl = await svgToPngDataUrl(svgUrl, BORDER_RASTER_WIDTH, BORDER_RASTER_HEIGHT);
  if (pngDataUrl) {
    doc.addImage(pngDataUrl, 'PNG', 0, 0, PAGE_WIDTH_MM, PAGE_HEIGHT_MM);
  }
}

/** Draws an inline god-icon SVG at a fixed mm box. Silently skips on failure. */
async function drawGodIcon(doc: jsPDF, svgMarkup: string, x: number, y: number, size: number): Promise<void> {
  try {
    // The god-icon SVGs contain Devanagari (ॐ etc), so the markup must be UTF-8
    // encoded before base64 — btoa() alone throws on any code point above U+00FF.
    // encodeURIComponent percent-escapes to UTF-8 bytes, which are then mapped
    // back to a binary string one byte at a time.
    const utf8 = encodeURIComponent(svgMarkup).replace(/%([0-9A-F]{2})/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    );
    const svgUrl = `data:image/svg+xml;base64,${btoa(utf8)}`;
    const iconPx = Math.round(size * RASTER_PX_PER_MM);
    const pngDataUrl = await svgToPngDataUrl(svgUrl, iconPx, iconPx);
    if (pngDataUrl) {
      doc.addImage(pngDataUrl, 'PNG', x, y, size, size);
    }
  } catch {
    // A god icon that fails to rasterise must not abort the whole document.
  }
}

/**
 * Draws the profile photo at its fixed corner position, reproducing the CSS
 * `object-fit: cover; object-position: top center` crop and the 3px
 * currentColor frame from .preview-photo-corner.
 */
function drawPhoto(
  doc: jsPDF,
  photoImg: HTMLImageElement,
  photoShape: 'rectangle' | 'circle',
  effectiveColor: string
): void {
  const w = PHOTO_WIDTH_MM;
  // .preview-photo-corner.photo-shape-circle overrides height to 128px (square).
  const h = photoShape === 'circle' ? PHOTO_WIDTH_MM : PHOTO_HEIGHT_MM;
  const x = PAGE_WIDTH_MM - CONTENT_RIGHT_MM - PHOTO_RIGHT_MM - w;
  const y = PHOTO_TOP_MM;

  // Crop the source to the frame's aspect ratio: centre horizontally, top-align
  // vertically, matching object-position: top center.
  const srcAspect = photoImg.naturalWidth / photoImg.naturalHeight;
  const destAspect = w / h;
  let sx = 0;
  const sy = 0;
  let sw = photoImg.naturalWidth;
  let sh = photoImg.naturalHeight;
  if (srcAspect > destAspect) {
    sw = photoImg.naturalHeight * destAspect;
    sx = (photoImg.naturalWidth - sw) / 2;
  } else {
    sh = photoImg.naturalWidth / destAspect;
  }

  // Supersample to RASTER_PX_PER_MM (~305 DPI). A 41mm-wide frame becomes ~496px
  // wide, which is the right order of magnitude for print — not a thumbnail, and
  // not a multi-thousand-pixel canvas that would bloat the file for no gain.
  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = Math.round(w * RASTER_PX_PER_MM);
  cropCanvas.height = Math.round(h * RASTER_PX_PER_MM);
  const cropCtx = cropCanvas.getContext('2d');
  if (!cropCtx) return;

  // Clip to the frame's shape before drawing, reproducing the CSS
  // `border-radius` + `overflow: hidden` on .preview-photo-corner. Without this
  // a circular frame would still show the source image's square corners.
  const cw = cropCanvas.width;
  const ch = cropCanvas.height;
  cropCtx.beginPath();
  if (photoShape === 'circle') {
    cropCtx.arc(cw / 2, ch / 2, Math.min(cw, ch) / 2, 0, Math.PI * 2);
  } else {
    const r = PHOTO_RADIUS_MM * RASTER_PX_PER_MM;
    cropCtx.moveTo(r, 0);
    cropCtx.arcTo(cw, 0, cw, ch, r);
    cropCtx.arcTo(cw, ch, 0, ch, r);
    cropCtx.arcTo(0, ch, 0, 0, r);
    cropCtx.arcTo(0, 0, cw, 0, r);
    cropCtx.closePath();
  }
  cropCtx.clip();
  cropCtx.drawImage(photoImg, sx, sy, sw, sh, 0, 0, cw, ch);
  doc.addImage(cropCanvas.toDataURL('image/png'), 'PNG', x, y, w, h);

  // The frame, stroked on the box's centre line so it reads like the CSS border.
  doc.setDrawColor(effectiveColor);
  doc.setLineWidth(PHOTO_BORDER_MM);
  const inset = PHOTO_BORDER_MM / 2;
  if (photoShape === 'circle') {
    doc.circle(x + w / 2, y + h / 2, w / 2 - inset, 'S');
  } else {
    doc.roundedRect(
      x + inset,
      y + inset,
      w - PHOTO_BORDER_MM,
      h - PHOTO_BORDER_MM,
      PHOTO_RADIUS_MM,
      PHOTO_RADIUS_MM,
      'S'
    );
  }
}

export async function renderBiodataPagePdf(doc: jsPDF, input: BiodataPdfInput): Promise<void> {
  const colors = palette(input.templateId, input.effectiveColor);

  doc.setFillColor(input.templateBackground || '#ffffff');
  doc.rect(0, 0, PAGE_WIDTH_MM, PAGE_HEIGHT_MM, 'F');

  await drawBorderFullPage(doc, input.effectiveColor, input.templateId);

  let cursorY = CONTENT_TOP_MM;
  const centerX = PAGE_WIDTH_MM / 2;

  // ── Header: Shree Ganesh line, flanked by the god icon on both sides ──
  if (input.showShreeGanesh) {
    doc.setFont('times', 'normal');
    doc.setFontSize(SHREE_GANESH_PT);
    doc.setTextColor(colors.shreeGanesh);
    doc.text(input.shreeGaneshText, centerX, cursorY, { align: 'center' });

    if (input.showGaneshaIcon && input.godIconSvg) {
      const textWidth = doc.getTextWidth(input.shreeGaneshText);
      const iconY = cursorY - GOD_ICON_SIZE_MM * 0.75;
      const leftX = centerX - textWidth / 2 - GOD_ICON_GAP_MM - GOD_ICON_SIZE_MM;
      const rightX = centerX + textWidth / 2 + GOD_ICON_GAP_MM;
      await drawGodIcon(doc, input.godIconSvg, leftX, iconY, GOD_ICON_SIZE_MM);
      await drawGodIcon(doc, input.godIconSvg, rightX, iconY, GOD_ICON_SIZE_MM);
    }
    cursorY += SHREE_GANESH_ADVANCE_MM;
  } else if (input.showGaneshaIcon && input.godIconSvg) {
    // .icon-only-header — the icon centred on its own line.
    await drawGodIcon(
      doc,
      input.godIconSvg,
      centerX - GOD_ICON_SIZE_MM / 2,
      cursorY - GOD_ICON_SIZE_MM * 0.75,
      GOD_ICON_SIZE_MM
    );
    cursorY += GOD_ICON_SIZE_MM * 0.5 + SHREE_GANESH_ADVANCE_MM;
  }

  if (input.showBiodata) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(BIODATA_PT);
    doc.setTextColor(colors.biodata);
    // .biodata-header has text-transform: uppercase and letter-spacing: 2px.
    doc.text(input.biodataText.toUpperCase(), centerX, cursorY, {
      align: 'center',
      charSpace: 2 * PX_TO_MM,
    });
    cursorY += BIODATA_ADVANCE_MM;
  }

  if (input.formData.fullName) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(NAME_PT);
    doc.setTextColor(colors.name);
    doc.text(input.formData.fullName, centerX, cursorY, { align: 'center' });
    cursorY += NAME_ADVANCE_MM;
  }

  // ── Profile photo, at its own fixed coordinate (independent of cursorY) ──
  let photoBottomY = 0;
  if (input.photoDataUrl) {
    try {
      const photoImg = await loadImage(input.photoDataUrl);
      drawPhoto(doc, photoImg, input.photoShape, input.effectiveColor);
      photoBottomY =
        PHOTO_TOP_MM + (input.photoShape === 'circle' ? PHOTO_WIDTH_MM : PHOTO_HEIGHT_MM);
    } catch (error) {
      console.error('Skipping the profile photo:', error);
    }
  }

  // ── Field sections ──
  const fieldStartX = CONTENT_LEFT_MM + FIELD_ROW_INSET_MM;
  const fullRowWidth = PAGE_WIDTH_MM - CONTENT_LEFT_MM - CONTENT_RIGHT_MM - FIELD_ROW_INSET_MM * 2;
  const valueX = fieldStartX + LABEL_COL_WIDTH_MM;

  /** Draws the fixed-position credit line on the page that is currently active. */
  const drawBrandCredit = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(BRAND_CREDIT_PT);
    doc.setTextColor(input.effectiveColor);
    doc.text('biodataforshaadi.com', centerX, PAGE_HEIGHT_MM - BRAND_CREDIT_BOTTOM_MM, {
      align: 'center',
    });
  };

  /**
   * Starts a continuation page when the next block of `height` mm would cross
   * into the credit line's reserved strip. Returns true if a break happened.
   */
  const breakPageIfNeeded = async (height: number): Promise<boolean> => {
    if (cursorY + height <= CONTENT_BOTTOM_LIMIT_MM) return false;
    drawBrandCredit();
    doc.addPage();
    doc.setFillColor(input.templateBackground || '#ffffff');
    doc.rect(0, 0, PAGE_WIDTH_MM, PAGE_HEIGHT_MM, 'F');
    await drawBorderFullPage(doc, input.effectiveColor, input.templateId);
    cursorY = CONTENT_TOP_MM;
    return true;
  };

  for (let sectionIndex = 0; sectionIndex < FIELD_SECTIONS.length; sectionIndex++) {
    const section = FIELD_SECTIONS[sectionIndex];
    const hasData = section.fields.some((f) => input.formData[f.key]);
    if (!hasData) continue;

    // Sections 0-1 (Personal + Religion) sit beside the photo and must dodge it
    // horizontally, mirroring .has-photo .preview-fields-before-photo-clear.
    // Once content flows onto a continuation page the photo is no longer there,
    // so the dodge and the clear-below only apply while still on page 1.
    const onFirstPage = doc.getNumberOfPages() === 1;
    const besidePhoto = photoBottomY > 0 && sectionIndex < 2 && onFirstPage;
    const rowWidth = besidePhoto ? fullRowWidth - PHOTO_FIELD_DODGE_MM : fullRowWidth;
    const valueWidth = rowWidth - LABEL_COL_WIDTH_MM;

    // Family Information onward starts below the photo, matching the
    // min-height: 210px clear on the first-two-sections wrapper.
    if (photoBottomY > 0 && sectionIndex === 2 && onFirstPage) {
      const clearY = Math.max(photoBottomY, CONTENT_TOP_MM + PHOTO_CLEAR_MIN_HEIGHT_MM);
      cursorY = Math.max(cursorY, clearY);
    }

    // Keep a section heading with at least its first row rather than stranding
    // it alone at the foot of a page.
    await breakPageIfNeeded(SECTION_GAP_MM + SECTION_LABEL_ADVANCE_MM + LINE_HEIGHT_MM);

    cursorY += SECTION_GAP_MM;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(SECTION_LABEL_PT);
    doc.setTextColor(colors.sectionLabel);
    // .preview-section-label: uppercase, letter-spacing 0.1em, flanked by rules.
    const labelText = section.title.toUpperCase();
    const labelCharSpace = 0.1 * (SECTION_LABEL_PT / 72) * 25.4;
    doc.text(labelText, fieldStartX + SECTION_LABEL_INSET_MM, cursorY, { charSpace: labelCharSpace });

    // The ::before/::after hairlines either side of the label text.
    const labelWidth = doc.getTextWidth(labelText) + labelCharSpace * labelText.length;
    const ruleY = cursorY - SECTION_LABEL_PT * 0.35 * (25.4 / 72);
    const ruleGap = 6 * PX_TO_MM;
    const ruleRightStart = fieldStartX + SECTION_LABEL_INSET_MM + labelWidth + ruleGap;
    const ruleRightEnd = fieldStartX + fullRowWidth - SECTION_LABEL_INSET_MM;
    doc.setDrawColor(colors.sectionLabel);
    doc.setLineWidth(0.2);
    if (ruleRightEnd > ruleRightStart) {
      doc.line(ruleRightStart, ruleY, ruleRightEnd, ruleY);
    }
    cursorY += SECTION_LABEL_ADVANCE_MM;

    for (const field of section.fields) {
      const value = input.formData[field.key];
      if (!value) continue;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(FIELD_PT);
      const valueLines: string[] = doc.splitTextToSize(value, Math.max(valueWidth, 20));
      const rowHeight =
        LINE_HEIGHT_MM + WRAP_LINE_HEIGHT_MM * Math.max(0, valueLines.length - 1);
      await breakPageIfNeeded(rowHeight);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(FIELD_PT);
      doc.setTextColor(colors.label);
      doc.text(field.label, fieldStartX, cursorY);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.value);
      doc.text(valueLines, valueX, cursorY);

      cursorY += rowHeight;
    }
  }

  // ── Brand credit: a fixed inset from the page bottom, never content-derived ──
  drawBrandCredit();

  // ── Additional photo pages: one per photo, each bordered, photo centred ──
  for (const photoDataUrl of input.additionalPhotoDataUrls) {
    doc.addPage();
    // A border-load failure must skip just this page, exactly as before — never
    // reject and discard the already-rendered main page.
    try {
      doc.setFillColor('#ffffff');
      doc.rect(0, 0, PAGE_WIDTH_MM, PAGE_HEIGHT_MM, 'F');
      await drawBorderFullPage(doc, input.effectiveColor, input.templateId);

      const img = await loadImage(photoDataUrl);
      // Fit within 80% of the page so the photo clears the border decoration's
      // inner margin on all sides, at the photo's own aspect ratio (never cropped).
      const photoScale = 0.8;
      const photoAspect = img.naturalWidth / img.naturalHeight;
      const pageAspect = PAGE_WIDTH_MM / PAGE_HEIGHT_MM;
      let pw: number;
      let ph: number;
      if (photoAspect > pageAspect) {
        pw = PAGE_WIDTH_MM * photoScale;
        ph = pw / photoAspect;
      } else {
        ph = PAGE_HEIGHT_MM * photoScale;
        pw = ph * photoAspect;
      }
      doc.addImage(photoDataUrl, 'PNG', (PAGE_WIDTH_MM - pw) / 2, (PAGE_HEIGHT_MM - ph) / 2, pw, ph);
    } catch (error) {
      console.error('Skipping an additional photo page:', error);
    }
  }
}
