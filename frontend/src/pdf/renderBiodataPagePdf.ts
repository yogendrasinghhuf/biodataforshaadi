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
   pages/biodata-preview-shared.css + pages/Preview.css at the CSS standard
   96 CSS px per inch:

       PX_TO_MM = 25.4 / 96 = 0.2646 mm per CSS px
       PX_TO_PT = 25.4/96 mm / 25.4 * 72 = 0.75 pt per CSS px

   WHY 96dpi AND NOT 210/650: this used to divide by the preview box's
   max-width (.preview-layout .preview-scroll-wrapper { max-width: 650px }),
   giving 0.3231 mm/px — a 22% vertical over-scale. That treated 650px as if it
   were a full 210mm sheet, but 650px is just how wide the preview column
   happens to be rendered on screen; it is a viewport-constrained box
   (`width: 100%` up to 650px), not a statement about paper size. The box's own
   `min-height: 794px` is the giveaway: 794px is exactly A4's 210mm width at
   96dpi (210/25.4*96 = 793.7), i.e. the preview is authored in real CSS px
   against a real A4 sheet, and 96dpi is the conversion CSS itself defines.

   The 650/794 discrepancy inflated every vertical advance by 794/650 = 1.22x.
   Horizontally it was harmless-looking (the row widths stayed self-consistent
   because every horizontal constant scaled together), but vertically it meant a
   perfectly normal 32-field biodata accumulated ~321mm of cursorY against a
   ~281mm limit and spilled its last section onto a near-empty page 2, leaving
   ~40% of page 1 blank. Measured in headless Chrome at the real 650px preview
   width, this biodata's rendered content is 951 CSS px tall; at 96dpi that is
   251mm of a 297mm page — comfortably one sheet, which is what the on-screen
   preview shows.

   Each constant below cites the CSS declaration it came from, so a future
   tweak to the on-screen preview has an obvious counterpart here. The px values
   are the real getBoundingClientRect heights measured in Chrome, not
   hand-summed box-model guesses.
   ========================================================================= */

const PAGE_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;

/** 25.4 / 96 — the CSS-standard px-to-mm scale (96 CSS px per inch). */
const PX_TO_MM = 25.4 / 96;
/** Same scale expressed in PDF points (jsPDF's setFontSize unit). */
const PX_TO_PT = (PX_TO_MM / 25.4) * 72;

/** .preview-mini-content-wrap padding: 16px 40px 40px -> 40px side padding. */
const CONTENT_LEFT_MM = 40 * PX_TO_MM; // 10.6
const CONTENT_RIGHT_MM = 40 * PX_TO_MM; // 10.6

/**
 * Baseline of the first header line. The content wrap starts 16px below the box
 * top, and the shree-ganesh header adds 6px of its own padding-top; a ~11.5px
 * glyph then sits on a baseline roughly its own cap-height lower. 16+6+10 = 32px
 * -> 10.3mm, plus the 20px (6.5mm) of extra top clearance the old PDF path
 * deliberately added via `pdfTopSpacingAdditionPx` so the header never kisses
 * the top border. Kept because that clearance was a real, user-reported fix.
 */
const CONTENT_TOP_MM = 32 * PX_TO_MM + 20 * PX_TO_MM; // 13.8

/** .preview-photo-corner width: 128px. */
const PHOTO_WIDTH_MM = 128 * PX_TO_MM; // 33.9
/** .preview-photo-corner height: 170.7px (the 3:4 rectangle the uploader crops to). */
const PHOTO_HEIGHT_MM = 170.7 * PX_TO_MM; // 45.2
/**
 * .preview-photo-corner right: 44px, measured from the content wrap's padding
 * box, which is itself inset 40px. So the gap from the page edge is 84px, i.e.
 * CONTENT_RIGHT_MM (40px) + 44px. This constant is that extra 44px.
 */
const PHOTO_RIGHT_MM = 44 * PX_TO_MM; // 11.6
/** .preview-photo-corner top: 155px, plus the same 20px PDF top clearance
 * applied to the header so the photo moves with the content. */
const PHOTO_TOP_MM = (135 + 20) * PX_TO_MM; // 41.1
/** .preview-photo-corner border: 3px solid currentColor. */
const PHOTO_BORDER_MM = 3 * PX_TO_MM; // 0.79
/** .preview-photo-corner border-radius: 8px. */
const PHOTO_RADIUS_MM = 8 * PX_TO_MM; // 2.1

/**
 * .preview-brand-credit bottom: 26px in the on-screen preview — but that box
 * never has the PDF's separately-rasterised full-bleed border artwork pressed
 * right up against it (the live preview's border is a thin overlay, not a
 * stretched-to-page-edge image). Several templates' decorative bottom pattern
 * sits well inside the page edge once stretched to a real A4 sheet, so the
 * credit line needs more real clearance here than its on-screen counterpart —
 * confirmed by an actual print run overlapping the border at the old, smaller
 * value. Widened to comfortably clear the most inset template's pattern.
 */
const BRAND_CREDIT_BOTTOM_MM = 14;

/**
 * Lowest baseline body text may occupy before it must break to a new page: the
 * credit line's own position plus clearance for its cap height and the border
 * artwork below it. The on-screen preview is an ever-growing scrollable box and
 * simply lets long content run on, but a PDF page has a hard edge — without
 * this, a fully-filled biodata's last sections printed on top of the credit
 * line and then off the paper entirely.
 */
const CONTENT_BOTTOM_LIMIT_MM = PAGE_HEIGHT_MM - BRAND_CREDIT_BOTTOM_MM - 8; // ~282.1

/** .preview-field strong { flex: 0 0 155px } — the label column's fixed width. */
const LABEL_COL_WIDTH_MM = 155 * PX_TO_MM; // 41.0
/** .preview-field padding: 3px 6px — the 6px horizontal inset on each row. */
const FIELD_ROW_INSET_MM = 6 * PX_TO_MM; // 1.6

/**
 * One field row. .preview-field is `font-size: 11px; line-height: 1.4;
 * padding: 3px 6px`, so the box model predicts 11*1.4 + 3 + 3 = 21.4px — but
 * the line box a browser actually generates is 15.672px, not 15.4px (the used
 * line-height is rounded to a whole device pixel and the strut is taken from
 * the font's own ascent/descent), giving a measured getBoundingClientRect
 * height of 21.672px. Verified in headless Chrome at the real 650px preview
 * width; every one of the 32 rows in the test biodata measured 21.672px.
 */
const LINE_HEIGHT_MM = 21.672 * PX_TO_MM; // 5.74
/** Wrapped continuation lines get the line box only, not the row padding again. */
const WRAP_LINE_HEIGHT_MM = 15.672 * PX_TO_MM; // 4.15

/**
 * .preview-section-label: `font-size: 0.8rem` (12.8px), `line-height` inherited
 * 1.4 -> a 17.92px line box, `padding: 9px 9px 4px`, `margin: 11px 0 2px`.
 * Measured border box = 30.906px, measured outer (incl. margins) = 43.906px.
 * Split into the gap above the label (margin-top + padding-top) and the advance
 * below it (the rest), so the two sum to the real 43.906px total.
 *
 * The old values summed to 38.8px because they used the 12.8px FONT SIZE as if
 * it were the line height, dropping the 1.4 multiplier entirely.
 */
const SECTION_GAP_MM = (11 + 9) * PX_TO_MM; // 5.29
const SECTION_LABEL_ADVANCE_MM = (43.906 - 20) * PX_TO_MM; // 6.33
/** .preview-section-label padding-left: 9px. */
const SECTION_LABEL_INSET_MM = 9 * PX_TO_MM; // 2.4

/* Font sizes, converted from the CSS px sizes at PX_TO_PT (0.75 pt per CSS px,
   the standard 96dpi->72pt relationship — a 16px rem is exactly 12pt).
   1rem = 16px throughout, matching the browser default this CSS relies on
   (neither :root nor html sets a font-size anywhere in the stylesheets). */
/** .shree-ganesh-text font-size: 0.72rem = 11.52px. */
const SHREE_GANESH_PT = 11.52 * PX_TO_PT; // 8.6
/** .biodata-header font-size: 0.67rem = 10.72px. */
const BIODATA_PT = 10.72 * PX_TO_PT; // 8.0
/** .preview-name-title font-size: 0.8rem = 12.8px. */
const NAME_PT = 12.8 * PX_TO_PT; // 9.6
/** .preview-section-label font-size: 0.8rem = 12.8px. */
const SECTION_LABEL_PT = 12.8 * PX_TO_PT; // 9.6
/** .preview-field / strong / span font-size: 11px. */
const FIELD_PT = 11 * PX_TO_PT; // 8.25
/** .preview-brand-credit font-size: 0.75rem = 12px. */
const BRAND_CREDIT_PT = 12 * PX_TO_PT; // 9.0

/* Vertical advances after each header block — the measured outer heights
   (getBoundingClientRect + margins) from headless Chrome, not box-model sums. */
/**
 * .shree-ganesh-header `padding: 6px 16px 3px` around a 15.109px line box
 * (the flex row's height is set by its tallest item). Measured 25.109px, plus
 * .biodata-header's own padding-top (0px -> 4px, widened so BIO DATA isn't
 * crammed against Shree Ganesh while the name below it kept a larger gap,
 * then tightened back down from an initial 8px which read as too loose)
 * added on top since this advance ends where that next box begins.
 * The old 19.13px sum applied the 1.4 line-height to .shree-ganesh-text's own
 * 0.72rem/11.52px font, but the flex CONTAINER's line box is what sets the
 * height here, and it inherits the 11px/1.4 body metric.
 */
const SHREE_GANESH_ADVANCE_MM = 25.109 * PX_TO_MM; // 6.64
/** .biodata-header: 0.67rem (10.72px) x 1.4 = 15.008px line + 6px padding-bottom. Measured 21px. */
const BIODATA_ADVANCE_MM = 21 * PX_TO_MM; // 5.56
/**
 * .preview-name-title: `font-size: 0.8rem` (12.8px) x 1.4 = 17.92px line box,
 * `padding: 8px 18px 6px` (tightened from an initial 12px that read as too
 * loose alongside the BIO DATA spacing fix), `margin: 0 0 6px`. Base measured
 * outer was 41.906px at the original 12px top padding; adjusted by -4px for
 * the padding reduction.
 *
 * NOTE: .border-template-elegant-red overrides this to `padding: 8px 12px 4px;
 * margin: 0 0 4px` -> a measured 33.906px at the ORIGINAL 12px baseline (i.e.
 * already close to this rule's new tightened value). The remaining difference
 * is under a single field row, so this uses the base-rule value for all
 * templates rather than branching, keeping the header a genuinely fixed
 * coordinate.
 */
const NAME_ADVANCE_MM = (41.906 - 10) * PX_TO_MM; // 8.87
/** .icon-center / .header-icon-* are 29px square. */
const GOD_ICON_SIZE_MM = 29 * PX_TO_MM; // 7.7
/** Gap between the god icons and the Shree Ganesh text (.shree-ganesh-header gap: 18px). */
const GOD_ICON_GAP_MM = 18 * PX_TO_MM; // 4.8

/**
 * .has-photo .preview-fields-before-photo-clear { min-height: 210px } — the
 * first two sections reserve at least the photo's height so Family Information
 * onwards starts below the photo instead of running behind it.
 */
const PHOTO_CLEAR_MIN_HEIGHT_MM = 210 * PX_TO_MM; // 55.6
/** .has-photo .preview-fields-before-photo-clear .preview-field { padding-right: 180px } */
const PHOTO_FIELD_DODGE_MM = 180 * PX_TO_MM; // 47.6

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
    // jsPDF's `align: 'center'` centers the text's width WITHOUT charSpace,
    // then still draws each character charSpace apart — so combining the two
    // options visibly drifts the text off-centre by roughly half the total
    // extra spacing. Compute the true rendered width (including the N-1 gaps
    // charSpace inserts between characters) and position the left edge
    // manually instead of relying on align: 'center'.
    const biodataUpper = input.biodataText.toUpperCase();
    const biodataCharSpaceMm = 2 * PX_TO_MM;
    const biodataWidth =
      doc.getTextWidth(biodataUpper) + biodataCharSpaceMm * Math.max(0, biodataUpper.length - 1);
    doc.text(biodataUpper, centerX - biodataWidth / 2, cursorY, {
      charSpace: biodataCharSpaceMm,
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
    //
    // This has to be evaluated per ROW, not once per section: a page break can
    // land in the middle of a section (Personal + Religion together can exceed
    // one page), and the photo only exists on page 1. Caching it at section
    // start left continuation-page rows narrowed to the dodged width with no
    // photo beside them, wrapping text that had the full width available.
    const availableValueWidth = (): number => {
      const dodging =
        photoBottomY > 0 &&
        sectionIndex < 2 &&
        doc.getNumberOfPages() === 1 &&
        cursorY < photoBottomY;
      const rowWidth = dodging ? fullRowWidth - PHOTO_FIELD_DODGE_MM : fullRowWidth;
      return rowWidth - LABEL_COL_WIDTH_MM;
    };

    // Family Information onward starts below the photo, matching the
    // min-height: 210px clear on the first-two-sections wrapper.
    if (photoBottomY > 0 && sectionIndex === 2 && doc.getNumberOfPages() === 1) {
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

    // The ::before/::after hairlines flanking the label text. The CSS makes the
    // label a flex row with a `flex: 1` pseudo-element on EACH side and a 6px
    // gap, so the two rules share the leftover width equally and the title ends
    // up centred between them — not left-aligned with a single trailing rule,
    // which is what this used to draw.
    const labelWidth = doc.getTextWidth(labelText) + labelCharSpace * labelText.length;
    const ruleY = cursorY - SECTION_LABEL_PT * 0.35 * (25.4 / 72);
    const ruleGap = 6 * PX_TO_MM;
    const rowLeft = fieldStartX + SECTION_LABEL_INSET_MM;
    const rowRight = fieldStartX + fullRowWidth - SECTION_LABEL_INSET_MM;
    const labelStartX = (rowLeft + rowRight) / 2 - labelWidth / 2;
    doc.text(labelText, labelStartX, cursorY, { charSpace: labelCharSpace });

    doc.setDrawColor(colors.sectionLabel);
    doc.setLineWidth(0.2);

    const ruleLeftEnd = labelStartX - ruleGap;
    if (ruleLeftEnd > rowLeft) {
      doc.line(rowLeft, ruleY, ruleLeftEnd, ruleY);
    }

    const ruleRightStart = labelStartX + labelWidth + ruleGap;
    if (rowRight > ruleRightStart) {
      doc.line(ruleRightStart, ruleY, rowRight, ruleY);
    }
    cursorY += SECTION_LABEL_ADVANCE_MM;

    for (const field of section.fields) {
      const value = input.formData[field.key];
      if (!value) continue;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(FIELD_PT);

      // Measure at the width available where the row currently sits, decide
      // whether it fits, then re-measure if the break changed the width (moving
      // to page 2 drops the photo dodge and widens the value column).
      const widthBeforeBreak = availableValueWidth();
      let valueLines: string[] = doc.splitTextToSize(value, Math.max(widthBeforeBreak, 20));
      const brokeToNewPage = await breakPageIfNeeded(
        LINE_HEIGHT_MM + WRAP_LINE_HEIGHT_MM * Math.max(0, valueLines.length - 1)
      );
      if (brokeToNewPage) {
        const widthAfterBreak = availableValueWidth();
        if (widthAfterBreak !== widthBeforeBreak) {
          valueLines = doc.splitTextToSize(value, Math.max(widthAfterBreak, 20));
        }
      }
      const rowHeight =
        LINE_HEIGHT_MM + WRAP_LINE_HEIGHT_MM * Math.max(0, valueLines.length - 1);

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
