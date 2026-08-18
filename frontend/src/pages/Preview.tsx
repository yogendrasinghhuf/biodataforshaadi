import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// import axios from 'axios'; // Will be used when payment is enabled
import { getTemplateById, getOriginalPrice } from '../data/templates';
import { getIconSvg } from '../data/godIcons';
import { generateBorderSVG } from '../data/borderPatterns';
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
