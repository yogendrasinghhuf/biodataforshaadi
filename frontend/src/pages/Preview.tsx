import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// import axios from 'axios'; // Will be used when payment is enabled
import { getTemplateById, getOriginalPrice } from '../data/templates';
import { getIconSvg } from '../data/godIcons';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import './Preview.css';
import './biodata-preview-shared.css';

// declare global {
//   interface Window {
//     Razorpay: any;
//   }
// }

const Preview: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { formData, religion, photo, additionalPhotos = [], templateId, customColor, selectedSymbol, showGaneshaIcon = true, showShreeGanesh = true, showBiodata = true, shreeGaneshText = '|| Shree Ganeshay Namah ||', biodataText = 'BIODATA', selectedGodIcon = 'om', photoShape = 'rectangle' } = location.state || {};

  // const [loading, setLoading] = useState(false); // Will be used when payment is enabled
  // const [paymentSuccess, setPaymentSuccess] = useState(false); // Will be used when payment is enabled
  // const [downloadReady, setDownloadReady] = useState(false); // Will be used when payment is enabled
  const template = getTemplateById(templateId);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!formData || !template) {
      navigate('/create');
    }

    // Razorpay script loading disabled - will be enabled when payment is added
    // const script = document.createElement('script');
    // script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    // script.async = true;
    // document.body.appendChild(script);
    // return () => { document.body.removeChild(script); };
  }, [formData, template, navigate]);

  // Renders the exact on-screen preview (border, colors, fonts, photo, layout) to a high-res
  // image and embeds it in the PDF, so the download always matches what the user saw.
  const generatePDF = async () => {
    if (!previewRef.current) return null;

    // Renders the exact on-screen preview (border, colors, fonts, photo, layout) to a high-res
    // image and embeds it in the PDF, so the download always matches what the user saw.
    // The border <img> needed explicit width/height on its SVG (added in generateBorderSVG)
    // for html2canvas to size and rasterize it correctly instead of falling back to a
    // browser-default 300x150 intrinsic size.
    // html2canvas also doesn't reliably honor CSS object-fit: cover on <img>, so the profile
    // photo is excluded from the capture and its cover-crop is redrawn manually afterward.
    // The border image is also excluded here — it's drawn separately, stretched to fill the
    // full A4 page (see below), so the page always looks full even when text content is short,
    // while the text/photo layer stays at its natural aspect ratio and is never distorted.
    const containerEl = previewRef.current;
    const photoContainerEl = containerEl.querySelector<HTMLElement>('.preview-photo-corner');
    const photoImgEl = photoContainerEl?.querySelector('img');
    const borderImgEl = containerEl.querySelector<HTMLImageElement>('.preview-border-img');

    // PDF-only spacing tweak: the gap above "Shree Ganesh" is reduced by this many px, applied
    // ONLY to html2canvas's offscreen clone (never the live containerEl, so the on-screen preview
    // is untouched). The photo is drawn afterward using the LIVE element's coordinates, so its
    // destY is shifted up by this same amount to stay in sync with the shifted content —
    // otherwise the two drift apart exactly like the earlier bug this fixes replaced.
    const pdfTopSpacingReductionPx = 10;

    const canvas = await html2canvas(containerEl, {
      scale: 3,
      useCORS: true,
      backgroundColor: null,
      ignoreElements: (el) => el.classList.contains('preview-photo-corner') || el.classList.contains('preview-border-img'),
      onclone: (clonedDoc) => {
        const clonedContainer = clonedDoc.querySelector<HTMLElement>('.biodata-preview-mini');
        if (clonedContainer) {
          // Several templates (sapphire-classic, crimson-rose, peacock-green, amber-classic,
          // royal-mandala) set background-color/background-image with !important on their
          // border-template-* class, which beats a plain style override — only setProperty's
          // 'important' priority can win, letting the background/border layer (drawn separately,
          // stretched to fill the page) show through instead of this element's own background.
          clonedContainer.style.setProperty('background-color', 'transparent', 'important');
          clonedContainer.style.setProperty('background-image', 'none', 'important');
        }
        const clonedContentWrap = clonedDoc.querySelector<HTMLElement>('.preview-mini-content-wrap');
        if (clonedContentWrap) {
          const currentPaddingTop = parseFloat(getComputedStyle(clonedContentWrap).paddingTop) || 0;
          clonedContentWrap.style.setProperty('padding-top', `${Math.max(0, currentPaddingTop - pdfTopSpacingReductionPx)}px`);
        }
      }
    });

    if (photoContainerEl && photoImgEl?.src) {
      const photoImg = new Image();
      await new Promise<void>((resolve, reject) => {
        photoImg.onload = () => resolve();
        photoImg.onerror = () => reject(new Error('profile photo failed to load'));
        photoImg.src = photoImgEl.src;
      });
      await photoImg.decode();

      // Map the photo container's on-screen box (relative to previewRef) onto canvas pixels.
      const containerRect = containerEl.getBoundingClientRect();
      const photoRect = photoContainerEl.getBoundingClientRect();
      const canvasScaleX = canvas.width / containerRect.width;
      const canvasScaleY = canvas.height / containerRect.height;
      const destX = (photoRect.left - containerRect.left) * canvasScaleX;
      // Shifted up by the same PDF-only spacing reduction applied to the clone's padding-top,
      // so the photo stays aligned with the content that moved up with it instead of drifting.
      const destY = (photoRect.top - containerRect.top - pdfTopSpacingReductionPx) * canvasScaleY;
      const destW = photoRect.width * canvasScaleX;
      const destH = photoRect.height * canvasScaleY;

      // Reproduce object-fit: cover + object-position: top center by cropping the source image.
      const srcAspect = photoImg.naturalWidth / photoImg.naturalHeight;
      const destAspect = destW / destH;
      let srcX = 0, srcY = 0, srcW = photoImg.naturalWidth, srcH = photoImg.naturalHeight;
      if (srcAspect > destAspect) {
        srcW = photoImg.naturalHeight * destAspect;
        srcX = (photoImg.naturalWidth - srcW) / 2;
      } else {
        srcH = photoImg.naturalWidth / destAspect;
        srcY = 0; // top-aligned, matching object-position: top center
      }

      const ctx = canvas.getContext('2d');
      if (ctx) {
        const isCircle = photoContainerEl.classList.contains('photo-shape-circle');
        const borderRadius = isCircle ? Math.min(destW, destH) / 2 : 8 * canvasScaleX;
        const borderWidth = 3 * canvasScaleX;

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Clip to the frame shape (rounded rect or circle) before drawing, matching the live CSS.
        ctx.beginPath();
        if (isCircle) {
          ctx.ellipse(destX + destW / 2, destY + destH / 2, destW / 2, destH / 2, 0, 0, Math.PI * 2);
        } else {
          const r = borderRadius;
          ctx.moveTo(destX + r, destY);
          ctx.arcTo(destX + destW, destY, destX + destW, destY + destH, r);
          ctx.arcTo(destX + destW, destY + destH, destX, destY + destH, r);
          ctx.arcTo(destX, destY + destH, destX, destY, r);
          ctx.arcTo(destX, destY, destX + destW, destY, r);
        }
        ctx.clip();
        ctx.drawImage(photoImg, srcX, srcY, srcW, srcH, destX, destY, destW, destH);
        ctx.restore();

        // Border, drawn on top, matching the live CSS's currentColor frame.
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.strokeStyle = effectiveColor;
        ctx.lineWidth = borderWidth;
        ctx.beginPath();
        if (isCircle) {
          ctx.ellipse(destX + destW / 2, destY + destH / 2, destW / 2, destH / 2, 0, 0, Math.PI * 2);
        } else {
          const r = borderRadius;
          ctx.moveTo(destX + r, destY);
          ctx.arcTo(destX + destW, destY, destX + destW, destY + destH, r);
          ctx.arcTo(destX + destW, destY + destH, destX, destY + destH, r);
          ctx.arcTo(destX, destY + destH, destX, destY, r);
          ctx.arcTo(destX, destY, destX + destW, destY, r);
          ctx.closePath();
        }
        ctx.stroke();
        ctx.restore();
      }
    }

    const imgData = canvas.toDataURL('image/png');

    const pageWidthMm = 210;
    const pageHeightMm = 297;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    // Background fill, full bleed — always safe to stretch since it's a flat color.
    const bgColor = template?.colors.background || '#ffffff';
    doc.setFillColor(bgColor);
    doc.rect(0, 0, pageWidthMm, pageHeightMm, 'F');

    // Border artwork, stretched to fill the entire page — a decorative frame/pattern reads fine
    // stretched, unlike text, so this is what makes the page look full even on short biodatas.
    // jsPDF can't embed an SVG data URI directly, so it's rasterized to PNG on an offscreen
    // canvas first, at a resolution matching the A4 page at print quality.
    if (borderImgEl?.src) {
      const borderSourceImg = new Image();
      await new Promise<void>((resolve, reject) => {
        borderSourceImg.onload = () => resolve();
        borderSourceImg.onerror = () => reject(new Error('border image failed to load'));
        borderSourceImg.src = borderImgEl.src;
      });
      await borderSourceImg.decode();

      const mmToPx = 12; // ~300 DPI at A4 dimensions
      const borderCanvas = document.createElement('canvas');
      borderCanvas.width = pageWidthMm * mmToPx;
      borderCanvas.height = pageHeightMm * mmToPx;
      const borderCtx = borderCanvas.getContext('2d');
      if (borderCtx) {
        borderCtx.drawImage(borderSourceImg, 0, 0, borderCanvas.width, borderCanvas.height);
        doc.addImage(borderCanvas.toDataURL('image/png'), 'PNG', 0, 0, pageWidthMm, pageHeightMm);
      }
    }

    // Text/photo content layer, kept at its natural aspect ratio and centered so nothing is
    // ever distorted or cropped — this never changes regardless of how much content is filled in.
    const artworkAspect = canvas.width / canvas.height;
    const pageAspect = pageWidthMm / pageHeightMm;

    let imgWidthMm: number;
    let imgHeightMm: number;
    if (artworkAspect > pageAspect) {
      imgWidthMm = pageWidthMm;
      imgHeightMm = imgWidthMm / artworkAspect;
    } else {
      imgHeightMm = pageHeightMm;
      imgWidthMm = imgHeightMm * artworkAspect;
    }
    const xOffset = (pageWidthMm - imgWidthMm) / 2;
    const yOffset = (pageHeightMm - imgHeightMm) / 2;

    doc.addImage(imgData, 'PNG', xOffset, yOffset, imgWidthMm, imgHeightMm);

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

          // Fit within 80% of the page (not the full page) so the photo clears the border
          // decoration's inner margin on all sides, matching the on-screen preview's inset.
          const photoScale = 0.8;
          const photoAspect = extraPhotoImg.naturalWidth / extraPhotoImg.naturalHeight;
          const pageAspectForPhoto = pageWidthMm / pageHeightMm;
          let photoWidthMm: number;
          let photoHeightMm: number;
          if (photoAspect > pageAspectForPhoto) {
            photoWidthMm = pageWidthMm * photoScale;
            photoHeightMm = photoWidthMm / photoAspect;
          } else {
            photoHeightMm = pageHeightMm * photoScale;
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

  const handleDownloadPDF = async () => {
    const pdf = await generatePDF();
    if (pdf) {
      pdf.save(`biodata_${formData.fullName || 'document'}.pdf`);
    }
  };

  // Payment functionality - disabled for now, will be enabled later
  // const handlePayment = async () => { ... };

  // Get the effective color (custom color overrides template color)
  const effectiveColor = customColor || template?.colors.primary || '#DC2626';

  // Generate SVG border with custom color for preview only
  const generateBorderSVG = (color: string, templateId: string) => {
    const encodedColor = color;

    // Mini preview patterns — thin strokes hugging the viewBox edge so they don't overlap text
    // (matches CreateBiodataNew.tsx's mini=true patterns; the download preview box is sized like the mini preview)
    const svgPatterns: { [key: string]: string } = {
      'elegant-red': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter'><rect x='6' y='6' width='388' height='588' stroke-width='0.8'/><rect x='12' y='12' width='376' height='576' stroke-width='0.4'/></g></svg>`,
      'modern-green': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter'><rect x='6' y='6' width='388' height='588' stroke-width='1'/></g></svg>`,
      'golden-yellow': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter' stroke-linecap='square'><path stroke-width='0.8' d='M30,6 L370,6 M394,30 L394,570 M370,594 L30,594 M6,570 L6,30'/><path stroke-width='0.8' d='M30,6 L18,6 L18,18 L6,18 L6,30'/><path stroke-width='0.8' d='M370,6 L382,6 L382,18 L394,18 L394,30'/><path stroke-width='0.8' d='M394,570 L394,582 L382,582 L382,594 L370,594'/><path stroke-width='0.8' d='M6,570 L6,582 L18,582 L18,594 L30,594'/></g></svg>`,
      'festive-trio': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-width='1' stroke-linecap='square'><path d='M6,80 L6,6 L80,6'/><path d='M320,6 L394,6 L394,80'/><path d='M394,520 L394,594 L320,594'/><path d='M80,594 L6,594 L6,520'/><path d='M150,6 L250,6'/><path d='M150,594 L250,594'/><path d='M6,220 L6,380'/><path d='M394,220 L394,380'/></g></svg>`,
      'royal-red': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}'><rect x='6' y='6' width='388' height='588' stroke-width='0.8' stroke-dasharray='8 4'/></g></svg>`,
      'nature-green': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}'><rect x='6' y='6' width='388' height='588' rx='20' stroke-width='0.8'/><rect x='12' y='12' width='376' height='576' rx='14' stroke-width='0.4'/></g></svg>`,
      'luxury-gold': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter'><path stroke-width='0.8' d='M8,8 L185,8 L200,24 L215,8 L392,8 L392,285 L376,300 L392,315 L392,592 L215,592 L200,576 L185,592 L8,592 L8,315 L24,300 L8,285 Z'/></g></svg>`,
      'maroon-elegance': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linecap='square'><path stroke-width='1' d='M8,160 L8,8 L160,8'/><path stroke-width='1' d='M240,8 L392,8 L392,160'/><path stroke-width='1' d='M392,440 L392,592 L240,592'/><path stroke-width='1' d='M160,592 L8,592 L8,440'/><path stroke-width='0.4' d='M16,150 L16,16 L150,16'/><path stroke-width='0.4' d='M250,16 L384,16 L384,150'/><path stroke-width='0.4' d='M384,450 L384,584 L250,584'/><path stroke-width='0.4' d='M150,584 L16,584 L16,450'/></g></svg>`,
      'pink-blossom': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-width='0.8'><path d='M6,6 L6,594'/><path d='M394,6 L394,594'/><path d='M6,6 Q16,16 26,6 Q36,16 46,6 Q56,16 66,6 Q76,16 86,6 Q96,16 106,6 Q116,16 126,6 Q136,16 146,6 Q156,16 166,6 Q176,16 186,6 Q196,16 206,6 Q216,16 226,6 Q236,16 246,6 Q256,16 266,6 Q276,16 286,6 Q296,16 306,6 Q316,16 326,6 Q336,16 346,6 Q356,16 366,6 Q376,16 386,6 Q392,12 394,6'/><path d='M6,594 Q16,584 26,594 Q36,584 46,594 Q56,584 66,594 Q76,584 86,594 Q96,584 106,594 Q116,584 126,594 Q136,584 146,594 Q156,584 166,594 Q176,584 186,594 Q196,584 206,594 Q216,584 226,594 Q236,584 246,594 Q256,584 266,594 Q276,584 286,594 Q296,584 306,594 Q316,584 326,594 Q336,584 346,594 Q356,584 366,594 Q376,584 386,594 Q392,588 394,594'/></g></svg>`,
      'emerald-classic': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}'><rect x='6' y='6' width='388' height='588' stroke-width='0.8'/><rect x='14' y='14' width='372' height='572' rx='22' stroke-width='0.4'/></g></svg>`,
      'royal-blue': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-width='0.4'><rect x='4' y='4' width='392' height='592'/><rect x='7' y='7' width='386' height='586'/><rect x='10' y='10' width='380' height='580'/></g></svg>`,
      'amber-classic': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-width='0.8' stroke-linecap='round' stroke-linejoin='round'><path d='M28,10 Q28,4 18,4 Q8,4 8,14 Q8,22 18,22 Q22,22 22,18 Q22,14 18,14'/><path d='M28,10 Q45,6 60,10 Q75,14 90,10 Q100,7 110,10'/><path stroke-width='0.6' d='M110,10 Q116,4 122,8 Q122,13 118,12'/><path d='M122,10 Q138,10 152,10'/><path d='M10,28 Q6,45 10,60 Q14,75 10,90 Q7,100 10,110'/><path stroke-width='0.6' d='M10,110 Q4,116 8,122 Q13,122 12,118'/><path d='M10,122 Q10,138 10,152'/><path d='M372,10 Q372,4 382,4 Q392,4 392,14 Q392,22 382,22 Q378,22 378,18 Q378,14 382,14'/><path d='M372,10 Q355,6 340,10 Q325,14 310,10 Q300,7 290,10'/><path stroke-width='0.6' d='M290,10 Q284,4 278,8 Q278,13 282,12'/><path d='M278,10 Q262,10 248,10'/><path d='M390,28 Q394,45 390,60 Q386,75 390,90 Q393,100 390,110'/><path stroke-width='0.6' d='M390,110 Q396,116 392,122 Q387,122 388,118'/><path d='M390,122 Q390,138 390,152'/><path d='M28,590 Q28,596 18,596 Q8,596 8,586 Q8,578 18,578 Q22,578 22,582 Q22,586 18,586'/><path d='M28,590 Q45,594 60,590 Q75,586 90,590 Q100,593 110,590'/><path stroke-width='0.6' d='M110,590 Q116,596 122,592 Q122,587 118,588'/><path d='M122,590 Q138,590 152,590'/><path d='M10,572 Q6,555 10,540 Q14,525 10,510 Q7,500 10,490'/><path stroke-width='0.6' d='M10,490 Q4,484 8,478 Q13,478 12,482'/><path d='M10,478 Q10,462 10,448'/><path d='M372,590 Q372,596 382,596 Q392,596 392,586 Q392,578 382,578 Q378,578 378,582 Q378,586 382,586'/><path d='M372,590 Q355,594 340,590 Q325,586 310,590 Q300,593 290,590'/><path stroke-width='0.6' d='M290,590 Q284,596 278,592 Q278,587 282,588'/><path d='M278,590 Q262,590 248,590'/><path d='M390,572 Q394,555 390,540 Q386,525 390,510 Q393,500 390,490'/><path stroke-width='0.6' d='M390,490 Q396,484 392,478 Q387,478 388,482'/><path d='M390,478 Q390,462 390,448'/></g><g fill='${encodedColor}'><circle cx='180' cy='10' r='1.5'/><circle cx='200' cy='10' r='2'/><circle cx='220' cy='10' r='1.5'/><circle cx='180' cy='590' r='1.5'/><circle cx='200' cy='590' r='2'/><circle cx='220' cy='590' r='1.5'/><circle cx='10' cy='280' r='1.5'/><circle cx='10' cy='300' r='2'/><circle cx='10' cy='320' r='1.5'/><circle cx='390' cy='280' r='1.5'/><circle cx='390' cy='300' r='2'/><circle cx='390' cy='320' r='1.5'/></g></svg>`,
      'royal-mandala': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}'><rect x='4' y='4' width='392' height='592' stroke-width='0.6' stroke-dasharray='0.5 4' stroke-linecap='round'/><rect x='8' y='8' width='384' height='584' stroke-width='1' stroke-dasharray='0.5 9' stroke-linecap='round'/><rect x='14' y='14' width='372' height='572' stroke-width='0.4'/></g></svg>`,
      'sapphire-classic': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter'><rect x='8' y='8' width='384' height='584' stroke-width='0.8'/><rect x='14' y='14' width='372' height='572' stroke-width='0.4'/></g><g fill='${encodedColor}'><rect x='4' y='4' width='8' height='8'/><rect x='388' y='4' width='8' height='8'/><rect x='4' y='588' width='8' height='8'/><rect x='388' y='588' width='8' height='8'/></g></svg>`,
      'crimson-rose': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter' stroke-width='0.7'><line x1='42' y1='7' x2='358' y2='7'/><line x1='42' y1='593' x2='358' y2='593'/><line x1='7' y1='62' x2='7' y2='538'/><line x1='393' y1='62' x2='393' y2='538'/></g><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter' stroke-width='0.3'><line x1='42' y1='11' x2='358' y2='11'/><line x1='42' y1='589' x2='358' y2='589'/><line x1='11' y1='62' x2='11' y2='538'/><line x1='389' y1='62' x2='389' y2='538'/></g><g fill='${encodedColor}'><polygon points='7,7 30,7 7,30'/><polygon points='393,7 370,7 393,30'/><polygon points='7,593 30,593 7,570'/><polygon points='393,593 370,593 393,570'/><polygon points='7,7 30,7 18,18'/><polygon points='393,7 370,7 382,18'/><polygon points='7,593 30,593 18,582'/><polygon points='393,593 370,593 382,582'/><rect x='4' y='4' width='6' height='6'/><rect x='390' y='4' width='6' height='6'/><rect x='4' y='590' width='6' height='6'/><rect x='390' y='590' width='6' height='6'/><polygon points='200,5 203,11 200,17 197,11'/><polygon points='200,583 203,589 200,595 197,589'/><polygon points='5,298 11,295 17,298 11,301'/><polygon points='383,298 389,295 395,298 389,301'/><circle cx='110' cy='7' r='1.5'/><circle cx='290' cy='7' r='1.5'/><circle cx='110' cy='593' r='1.5'/><circle cx='290' cy='593' r='1.5'/><circle cx='7' cy='180' r='1.5'/><circle cx='7' cy='420' r='1.5'/><circle cx='393' cy='180' r='1.5'/><circle cx='393' cy='420' r='1.5'/></g></svg>`,
      'peacock-green': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter'><rect x='8' y='8' width='384' height='584' stroke-width='1' stroke-dasharray='16 7'/></g><g fill='${encodedColor}'><path d='M8,2 L14,8 L8,14 L2,8 Z'/><path d='M392,2 L398,8 L392,14 L386,8 Z'/><path d='M8,586 L14,592 L8,598 L2,592 Z'/><path d='M392,586 L398,592 L392,598 L386,592 Z'/></g></svg>`,
    };

    // Default pattern (thin, matching the mini-preview pattern set)
    const defaultPattern = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g stroke='${encodedColor}' stroke-width='1' fill='none'><path d='M5,5 L60,5 M5,5 L5,60 M395,5 L340,5 M395,5 L395,60 M5,595 L60,595 M5,595 L5,540 M395,595 L340,595 M395,595 L395,540 M80,5 L320,5 M80,595 L320,595 M5,100 L5,500 M395,100 L395,500'/></g></svg>`;

    // Use hasOwnProperty to check if template exists, to handle empty string patterns
    const svgPattern = templateId in svgPatterns ? svgPatterns[templateId] : defaultPattern;
    if (!svgPattern) {
      return 'none';
    }
    // Explicit width/height so any consumer (this <img>, or html2canvas capturing it) sizes
    // the SVG correctly, instead of a browser falling back to a 300x150 default intrinsic size.
    const sizedSvgPattern = svgPattern.replace('<svg ', "<svg width='400' height='600' ");
    return `url("data:image/svg+xml;base64,${btoa(sizedSvgPattern)}")`;
  };

  if (!formData || !template) {
    return null;
  }

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

  // Payment success screen - disabled for now, will be enabled when payment is added
  // if (paymentSuccess) { ... }

  return (
    <div className="preview-page">
      <div className="container">
        {/* Back Button */}
        <button className="btn btn-outline back-button" onClick={handleBack}>
          ← Back to Edit
        </button>

        <div className="page-header fade-in">
          <h1 className="page-title">Preview & Download Your Biodata</h1>
          <p className="page-subtitle">
            Review your information and download your biodata
          </p>
        </div>

        <div className="preview-layout">
          {/* Biodata Preview - identical structure to mini preview in CreateBiodataNew */}
          <div className="preview-scroll-wrapper">
          <div
            ref={previewRef}
            className={`biodata-preview-mini mehndi-border border-template-${template?.id || 'elegant-red'} ${!showShreeGanesh ? 'hide-shree-ganesh' : ''} ${!showBiodata ? 'hide-biodata' : ''} ${photo ? 'has-photo' : ''}`}
            style={{
              position: 'relative',
              overflow: 'hidden',
              backgroundColor: template?.colors.background,
              ['--border-color' as any]: effectiveColor,
              ['--border-image' as any]: generateBorderSVG(effectiveColor, template?.id || 'elegant-red'),
              ['--shree-ganesh-text' as any]: `"${shreeGaneshText}"`,
              ['--biodata-text' as any]: `"${biodataText}"`,
            }}
          >
            <img
              className="preview-border-img"
              src={generateBorderSVG(effectiveColor, template?.id || 'elegant-red').replace(/^url\("/, '').replace(/"\)$/, '')}
              alt=""
              aria-hidden="true"
            />
            <div className="preview-inner-scroll">
            <div className="preview-mini-content-wrap">
{/* God Icon at top center */}
              {showGaneshaIcon && selectedGodIcon && (
                <div
                  className="ganesha-icon-header"
                  dangerouslySetInnerHTML={{ __html: getIconSvg(selectedGodIcon) }}
                />
              )}

              {/* Religious symbol as watermark - randomly placed at 4 locations */}
              {selectedSymbol && (
                <div className="symbol-watermark" style={{ color: effectiveColor }}>
                  <span>{selectedSymbol}</span>
                  <span>{selectedSymbol}</span>
                  <span>{selectedSymbol}</span>
                  <span>{selectedSymbol}</span>
                </div>
              )}

              {/* Photo in top right corner */}
              {photo && (
                <div className={`preview-photo-corner photo-shape-${photoShape}`} style={{ borderColor: effectiveColor }}>
                  <img src={URL.createObjectURL(photo)} alt="Profile" />
                </div>
              )}

              {/* Content Preview */}
              <div className="preview-mini-content">

                {/* If Shree Ganesh toggle is ON - show text with icons on both sides */}
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

                {/* If Shree Ganesh toggle is OFF but icon toggle is ON - show icon alone at center */}
                {!showShreeGanesh && showGaneshaIcon && (
                  <div className="icon-only-header">
                    <span
                      className="icon-center"
                      dangerouslySetInnerHTML={{ __html: getIconSvg(selectedGodIcon) }}
                    />
                  </div>
                )}

                {/* BIO DATA text below Shree Ganesh */}
                {showBiodata && (
                  <div className="biodata-header">
                    {biodataText}
                  </div>
                )}

                {/* Name at the top as title */}
                {formData.fullName && (
                  <h2 className="preview-name-title">
                    {formData.fullName}
                  </h2>
                )}

                {/* Wraps Personal Details + Religion Details so a min-height (applied via CSS
                    when a photo exists) can push Family Information and everything after it
                    below the photo, instead of letting a short Personal Details section leave
                    a later section's full-width label/divider running behind the photo. */}
                <div className="preview-fields-before-photo-clear">
                {/* Personal Information */}
                {(formData.dateOfBirth || formData.timeOfBirth || formData.placeOfBirth || formData.height || formData.weight || formData.complexion || formData.bloodGroup || formData.maritalStatus || formData.education || formData.college || formData.occupation || formData.company || formData.annualIncome || formData.workLocation) && (
                  <div className="preview-section-label" style={{ color: effectiveColor }}>Personal Details</div>
                )}
                {formData.dateOfBirth && <div className="preview-field"><strong>Date of Birth:</strong><span>{formData.dateOfBirth}</span></div>}
                {formData.timeOfBirth && <div className="preview-field"><strong>Time of Birth:</strong><span>{formData.timeOfBirth}</span></div>}
                {formData.placeOfBirth && <div className="preview-field"><strong>Place of Birth:</strong><span>{formData.placeOfBirth}</span></div>}
                {formData.height && <div className="preview-field"><strong>Height:</strong><span>{formData.height}</span></div>}
                {formData.weight && <div className="preview-field"><strong>Weight:</strong><span>{formData.weight}</span></div>}
                {formData.complexion && <div className="preview-field"><strong>Complexion:</strong><span>{formData.complexion}</span></div>}
                {formData.bloodGroup && <div className="preview-field"><strong>Blood Group:</strong><span>{formData.bloodGroup}</span></div>}
                {formData.maritalStatus && <div className="preview-field"><strong>Marital Status:</strong><span>{formData.maritalStatus}</span></div>}

                {/* Education & Career */}
                {formData.education && <div className="preview-field"><strong>Education:</strong><span>{formData.education}</span></div>}
                {formData.college && <div className="preview-field"><strong>College/University:</strong><span>{formData.college}</span></div>}
                {formData.occupation && <div className="preview-field"><strong>Occupation:</strong><span>{formData.occupation}</span></div>}
                {formData.company && <div className="preview-field"><strong>Company:</strong><span>{formData.company}</span></div>}
                {formData.annualIncome && <div className="preview-field"><strong>Annual Income:</strong><span>{formData.annualIncome}</span></div>}
                {formData.workLocation && <div className="preview-field"><strong>Work Location:</strong><span>{formData.workLocation}</span></div>}

                {/* Religion Details */}
                {(formData.caste || formData.subCaste || formData.gotra || formData.rashi || formData.nakshatra || formData.manglik || formData.deity || formData.sect || formData.community || formData.maslak || formData.namazPractice || formData.hijab || formData.arabicName || formData.denomination || formData.churchAffiliation || formData.baptized || formData.sundayService || formData.jatha || formData.amritdhari || formData.keshdhari || formData.gurudwaraVisit) && (
                  <div className="preview-section-label" style={{ color: effectiveColor }}>Religion Details</div>
                )}
                {formData.caste && <div className="preview-field"><strong>Caste:</strong><span>{formData.caste}</span></div>}
                {formData.subCaste && <div className="preview-field"><strong>Sub-Caste:</strong><span>{formData.subCaste}</span></div>}
                {formData.gotra && <div className="preview-field"><strong>Gotra:</strong><span>{formData.gotra}</span></div>}
                {formData.rashi && <div className="preview-field"><strong>Rashi:</strong><span>{formData.rashi}</span></div>}
                {formData.nakshatra && <div className="preview-field"><strong>Nakshatra:</strong><span>{formData.nakshatra}</span></div>}
                {formData.manglik && <div className="preview-field"><strong>Manglik:</strong><span>{formData.manglik}</span></div>}
                {formData.deity && <div className="preview-field"><strong>Kul Devta/Devi:</strong><span>{formData.deity}</span></div>}
                {formData.sect && <div className="preview-field"><strong>Sect:</strong><span>{formData.sect}</span></div>}
                {formData.community && <div className="preview-field"><strong>Community:</strong><span>{formData.community}</span></div>}
                {formData.maslak && <div className="preview-field"><strong>Maslak:</strong><span>{formData.maslak}</span></div>}
                {formData.namazPractice && <div className="preview-field"><strong>Namaz Practice:</strong><span>{formData.namazPractice}</span></div>}
                {formData.hijab && <div className="preview-field"><strong>Hijab/Purdah:</strong><span>{formData.hijab}</span></div>}
                {formData.arabicName && <div className="preview-field"><strong>Arabic Name:</strong><span>{formData.arabicName}</span></div>}
                {formData.denomination && <div className="preview-field"><strong>Denomination:</strong><span>{formData.denomination}</span></div>}
                {formData.churchAffiliation && <div className="preview-field"><strong>Church:</strong><span>{formData.churchAffiliation}</span></div>}
                {formData.baptized && <div className="preview-field"><strong>Baptized:</strong><span>{formData.baptized}</span></div>}
                {formData.sundayService && <div className="preview-field"><strong>Church Attendance:</strong><span>{formData.sundayService}</span></div>}
                {formData.jatha && <div className="preview-field"><strong>Jatha:</strong><span>{formData.jatha}</span></div>}
                {formData.amritdhari && <div className="preview-field"><strong>Amritdhari:</strong><span>{formData.amritdhari}</span></div>}
                {formData.keshdhari && <div className="preview-field"><strong>Keshdhari:</strong><span>{formData.keshdhari}</span></div>}
                {formData.gurudwaraVisit && <div className="preview-field"><strong>Gurudwara Visit:</strong><span>{formData.gurudwaraVisit}</span></div>}
                </div>

                {/* Family Details */}
                {(formData.fatherName || formData.fatherOccupation || formData.motherName || formData.motherOccupation || formData.siblings || formData.siblingsMarried || formData.familyType || formData.familyValues || formData.familyIncome || formData.nativePlace || formData.currentAddress) && (
                  <div className="preview-section-label" style={{ color: effectiveColor }}>Family Information</div>
                )}
                {formData.fatherName && <div className="preview-field"><strong>Father's Name:</strong><span>{formData.fatherName}</span></div>}
                {formData.fatherOccupation && <div className="preview-field"><strong>Father's Occupation:</strong><span>{formData.fatherOccupation}</span></div>}
                {formData.motherName && <div className="preview-field"><strong>Mother's Name:</strong><span>{formData.motherName}</span></div>}
                {formData.motherOccupation && <div className="preview-field"><strong>Mother's Occupation:</strong><span>{formData.motherOccupation}</span></div>}
                {formData.siblings && <div className="preview-field"><strong>Siblings:</strong><span>{formData.siblings}</span></div>}
                {formData.siblingsMarried && <div className="preview-field"><strong>Siblings Married:</strong><span>{formData.siblingsMarried}</span></div>}
                {formData.familyType && <div className="preview-field"><strong>Family Type:</strong><span>{formData.familyType}</span></div>}
                {formData.familyValues && <div className="preview-field"><strong>Family Values:</strong><span>{formData.familyValues}</span></div>}
                {formData.familyIncome && <div className="preview-field"><strong>Family Income:</strong><span>{formData.familyIncome}</span></div>}
                {formData.nativePlace && <div className="preview-field"><strong>Native Place:</strong><span>{formData.nativePlace}</span></div>}
                {formData.currentAddress && <div className="preview-field"><strong>Current Address:</strong><span>{formData.currentAddress}</span></div>}

                {/* Contact Information */}
                {(formData.phone || formData.email || formData.whatsapp || formData.address) && (
                  <div className="preview-section-label" style={{ color: effectiveColor }}>Contact Information</div>
                )}
                {formData.phone && <div className="preview-field"><strong>Phone:</strong><span>{formData.phone}</span></div>}
                {formData.email && <div className="preview-field"><strong>Email:</strong><span>{formData.email}</span></div>}
                {formData.whatsapp && <div className="preview-field"><strong>Alternate No:</strong><span>{formData.whatsapp}</span></div>}
                {formData.address && <div className="preview-field"><strong>Address:</strong><span>{formData.address}</span></div>}

                {/* Partner Preferences */}
                {(formData.partnerAgeRange || formData.partnerHeight || formData.partnerEducation || formData.partnerOccupation || formData.partnerLocation || formData.otherPreferences) && (
                  <div className="preview-section-label" style={{ color: effectiveColor }}>Partner Preferences</div>
                )}
                {formData.partnerAgeRange && <div className="preview-field"><strong>Partner Age Range:</strong><span>{formData.partnerAgeRange}</span></div>}
                {formData.partnerHeight && <div className="preview-field"><strong>Partner Height:</strong><span>{formData.partnerHeight}</span></div>}
                {formData.partnerEducation && <div className="preview-field"><strong>Partner Education:</strong><span>{formData.partnerEducation}</span></div>}
                {formData.partnerOccupation && <div className="preview-field"><strong>Partner Occupation:</strong><span>{formData.partnerOccupation}</span></div>}
                {formData.partnerLocation && <div className="preview-field"><strong>Partner Location:</strong><span>{formData.partnerLocation}</span></div>}
                {formData.otherPreferences && <div className="preview-field"><strong>Other Preferences:</strong><span>{formData.otherPreferences}</span></div>}

                {/* Empty state */}
                {Object.keys(formData).length === 0 && !photo && (
                  <div className="preview-empty">
                    <p>Start filling the form to see your biodata preview here</p>
                  </div>
                )}
              </div>
            </div> {/* preview-mini-content-wrap */}
            </div> {/* preview-inner-scroll */}

            {/* Pinned to the box's own bottom edge (not the flowing content), matching the PDF's placement above the template's border */}
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

          {/* Order Summary Card */}
          <div className="payment-card card">
            <span className="payment-eyebrow">Order Summary</span>

            <div className="payment-template-row">
              <span className="payment-template-swatch" style={{ backgroundColor: effectiveColor }}></span>
              <span className="payment-template-name">{template.name}</span>
            </div>

            <div className="payment-details">
              <div className="payment-row total">
                <span>Template Price</span>
                <span>
                  <span className="payment-amount">₹11</span>
                  <span className="payment-amount-original">₹{getOriginalPrice(template.price)}</span>
                </span>
              </div>
              <div className="payment-offer-note">
                <span className="payment-offer-badge">
                  {Math.round((1 - 11 / getOriginalPrice(template.price)) * 100)}% OFF
                </span>
                <span className="payment-offer-label">Limited time offer</span>
              </div>
            </div>

            <button
              className="btn btn-success btn-full"
              onClick={handleDownloadPDF}
            >
              Pay & Download PDF
            </button>

            <div className="payment-info">
              <p>📄 High-quality PDF format</p>
              <p>🔒 100% Safe Payments</p>
              <p>⚡ Lightning Fast</p>
              <p>⬇️ Instant Download, No Waiting</p>
            </div>

            <button
              className="btn btn-outline btn-full"
              onClick={handleBack}
              style={{ marginTop: '12px' }}
            >
              ← Edit Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preview;
