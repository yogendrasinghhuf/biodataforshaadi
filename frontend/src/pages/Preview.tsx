import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// import axios from 'axios'; // Will be used when payment is enabled
import { getTemplateById, getOriginalPrice } from '../data/templates';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import BiodataPage from '../components/BiodataPage';
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

    // PDF-only spacing tweak: adds clearance above "Shree Ganesh" so it never touches the top
    // border. The content layer is now always fit to the page by width and anchored to the top
    // (see imgWidthMm/yOffset below), so this offset lands at the same fixed spot on every PDF
    // regardless of how much the form is filled in. Applied ONLY to html2canvas's offscreen clone
    // (never the live containerEl, so the on-screen preview is untouched). The photo is drawn
    // afterward using the LIVE element's coordinates, so its destY is shifted down by this same
    // amount to stay in sync with the shifted content — otherwise the two drift apart.
    const pdfTopSpacingAdditionPx = 20;

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
          clonedContentWrap.style.setProperty('padding-top', `${currentPaddingTop + pdfTopSpacingAdditionPx}px`);
        }
        // The top padding above pushed all content down, eating into the credit line's bottom
        // clearance (it's pinned via `bottom: 26px` within the same captured box). Push it up by
        // the same amount so it keeps clearing the bottom border.
        const clonedBrandCredit = clonedDoc.querySelector<HTMLElement>('.preview-brand-credit');
        if (clonedBrandCredit) {
          const currentBottom = parseFloat(getComputedStyle(clonedBrandCredit).bottom) || 0;
          clonedBrandCredit.style.setProperty('bottom', `${currentBottom + pdfTopSpacingAdditionPx}px`);
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
      // Shifted down by the same PDF-only spacing addition applied to the clone's padding-top,
      // so the photo stays aligned with the content that moved down with it instead of drifting.
      const destY = (photoRect.top - containerRect.top + pdfTopSpacingAdditionPx) * canvasScaleY;
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

    // Text/photo content layer, always fit to the page's full width and anchored to the top
    // edge — the same ratio a fully-filled form gets. This keeps Shree Ganesh/BIO DATA/the
    // biodataforshaadi.com credit line at the exact same spot on every PDF, regardless of how
    // much the form is filled in. The content wrap has no max-height (it's an ever-growing
    // scrollable box on screen), so unusually long content (e.g. a very long address) may run
    // past the bottom border edge rather than shrinking — an accepted rare-case tradeoff for
    // keeping the header/credit position stable in the common case.
    const artworkAspect = canvas.width / canvas.height;
    const imgWidthMm = pageWidthMm;
    const imgHeightMm = imgWidthMm / artworkAspect;
    const xOffset = 0;
    const yOffset = 0;

    doc.addImage(imgData, 'PNG', xOffset, yOffset, imgWidthMm, imgHeightMm);

    // Additional photo pages — each gets its own page: the same template border rasterized
    // fresh (reusing the exact rasterization step used for the main page above), on a plain
    // white background, with the photo centered inside at its own true aspect ratio so it's
    // never distorted or cropped, matching the main page's text/photo layer.
    for (const photoFile of additionalPhotos) {
      doc.addPage();

      // Border AND photo are both inside this one try/catch — a border-load failure must skip
      // just this page like a photo-load failure does, not reject generatePDF() entirely and
      // abort the whole download (that would discard the already-rendered main page and any
      // other successfully-loaded extra photos, silently, since handleDownloadPDF has no catch).
      let extraPhotoUrl: string | undefined;
      try {
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

        const extraPhotoImg = new Image();
        extraPhotoUrl = URL.createObjectURL(photoFile);
        await new Promise<void>((resolve, reject) => {
          extraPhotoImg.onload = () => resolve();
          extraPhotoImg.onerror = () => reject(new Error('additional photo failed to load'));
          extraPhotoImg.src = extraPhotoUrl!;
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
      } catch (error) {
        console.error('Skipping an additional photo page:', error);
      } finally {
        // Runs whether the photo loaded successfully or not, so a failed load never leaks the
        // blob URL — previously this was only revoked on the success path.
        if (extraPhotoUrl) {
          URL.revokeObjectURL(extraPhotoUrl);
        }
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
