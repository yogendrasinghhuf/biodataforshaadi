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
  const { formData, religion, photo, templateId, customColor, selectedSymbol, showGaneshaIcon = true, showShreeGanesh = true, showBiodata = true, shreeGaneshText = '|| Shree Ganeshay Namah ||', biodataText = 'BIODATA', selectedGodIcon = 'om', photoShape = 'rectangle' } = location.state || {};

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
    const containerEl = previewRef.current;
    const photoContainerEl = containerEl.querySelector<HTMLElement>('.preview-photo-corner');
    const photoImgEl = photoContainerEl?.querySelector('img');

    const canvas = await html2canvas(containerEl, {
      scale: 3,
      useCORS: true,
      backgroundColor: null,
      ignoreElements: (el) => el.classList.contains('preview-photo-corner')
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
      const destY = (photoRect.top - containerRect.top) * canvasScaleY;
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

    // A4 in mm — the biodata artwork's real aspect ratio doesn't match A4's, so it's scaled to
    // fit entirely within the page (whichever dimension is the tighter constraint) and centered.
    // This never crops any content — content length varies per user, so a fixed crop amount
    // that's safe for one biodata can clip real text/border on another with more filled fields.
    const pageWidthMm = 210;
    const pageHeightMm = 297;
    const artworkAspect = canvas.width / canvas.height;
    const pageAspect = pageWidthMm / pageHeightMm;

    let imgWidthMm: number;
    let imgHeightMm: number;
    if (artworkAspect > pageAspect) {
      // Artwork is relatively wider than the page — width is the limiting dimension.
      imgWidthMm = pageWidthMm;
      imgHeightMm = imgWidthMm / artworkAspect;
    } else {
      // Artwork is relatively taller than the page — height is the limiting dimension.
      imgHeightMm = pageHeightMm;
      imgWidthMm = imgHeightMm * artworkAspect;
    }
    const xOffset = (pageWidthMm - imgWidthMm) / 2;
    const yOffset = (pageHeightMm - imgHeightMm) / 2;

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    doc.addImage(imgData, 'PNG', xOffset, yOffset, imgWidthMm, imgHeightMm);

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

                {/* Personal Information */}
                {(formData.dateOfBirth || formData.timeOfBirth || formData.placeOfBirth || formData.height || formData.weight || formData.complexion || formData.bloodGroup || formData.maritalStatus || formData.education || formData.college || formData.occupation || formData.company || formData.annualIncome || formData.workLocation) && (
                  <div className="preview-section-label" style={{ color: effectiveColor }}>Personal Details</div>
                )}
                {formData.dateOfBirth && <div className="preview-field"><strong>Date of Birth:</strong> {formData.dateOfBirth}</div>}
                {formData.timeOfBirth && <div className="preview-field"><strong>Time of Birth:</strong> {formData.timeOfBirth}</div>}
                {formData.placeOfBirth && <div className="preview-field"><strong>Place of Birth:</strong> {formData.placeOfBirth}</div>}
                {formData.height && <div className="preview-field"><strong>Height:</strong> {formData.height}</div>}
                {formData.weight && <div className="preview-field"><strong>Weight:</strong> {formData.weight}</div>}
                {formData.complexion && <div className="preview-field"><strong>Complexion:</strong> {formData.complexion}</div>}
                {formData.bloodGroup && <div className="preview-field"><strong>Blood Group:</strong> {formData.bloodGroup}</div>}
                {formData.maritalStatus && <div className="preview-field"><strong>Marital Status:</strong> {formData.maritalStatus}</div>}

                {/* Education & Career */}
                {formData.education && <div className="preview-field"><strong>Education:</strong> {formData.education}</div>}
                {formData.college && <div className="preview-field"><strong>College/University:</strong> {formData.college}</div>}
                {formData.occupation && <div className="preview-field"><strong>Occupation:</strong> {formData.occupation}</div>}
                {formData.company && <div className="preview-field"><strong>Company:</strong> {formData.company}</div>}
                {formData.annualIncome && <div className="preview-field"><strong>Annual Income:</strong> {formData.annualIncome}</div>}
                {formData.workLocation && <div className="preview-field"><strong>Work Location:</strong> {formData.workLocation}</div>}

                {/* Religion Details */}
                {(formData.caste || formData.subCaste || formData.gotra || formData.rashi || formData.nakshatra || formData.manglik || formData.deity || formData.sect || formData.community || formData.maslak || formData.namazPractice || formData.hijab || formData.arabicName || formData.denomination || formData.churchAffiliation || formData.baptized || formData.sundayService || formData.jatha || formData.amritdhari || formData.keshdhari || formData.gurudwaraVisit) && (
                  <div className="preview-section-label" style={{ color: effectiveColor }}>Religion Details</div>
                )}
                {formData.caste && <div className="preview-field"><strong>Caste:</strong> {formData.caste}</div>}
                {formData.subCaste && <div className="preview-field"><strong>Sub-Caste:</strong> {formData.subCaste}</div>}
                {formData.gotra && <div className="preview-field"><strong>Gotra:</strong> {formData.gotra}</div>}
                {formData.rashi && <div className="preview-field"><strong>Rashi:</strong> {formData.rashi}</div>}
                {formData.nakshatra && <div className="preview-field"><strong>Nakshatra:</strong> {formData.nakshatra}</div>}
                {formData.manglik && <div className="preview-field"><strong>Manglik:</strong> {formData.manglik}</div>}
                {formData.deity && <div className="preview-field"><strong>Kul Devta/Devi:</strong> {formData.deity}</div>}
                {formData.sect && <div className="preview-field"><strong>Sect:</strong> {formData.sect}</div>}
                {formData.community && <div className="preview-field"><strong>Community:</strong> {formData.community}</div>}
                {formData.maslak && <div className="preview-field"><strong>Maslak:</strong> {formData.maslak}</div>}
                {formData.namazPractice && <div className="preview-field"><strong>Namaz Practice:</strong> {formData.namazPractice}</div>}
                {formData.hijab && <div className="preview-field"><strong>Hijab/Purdah:</strong> {formData.hijab}</div>}
                {formData.arabicName && <div className="preview-field"><strong>Arabic Name:</strong> {formData.arabicName}</div>}
                {formData.denomination && <div className="preview-field"><strong>Denomination:</strong> {formData.denomination}</div>}
                {formData.churchAffiliation && <div className="preview-field"><strong>Church:</strong> {formData.churchAffiliation}</div>}
                {formData.baptized && <div className="preview-field"><strong>Baptized:</strong> {formData.baptized}</div>}
                {formData.sundayService && <div className="preview-field"><strong>Church Attendance:</strong> {formData.sundayService}</div>}
                {formData.jatha && <div className="preview-field"><strong>Jatha:</strong> {formData.jatha}</div>}
                {formData.amritdhari && <div className="preview-field"><strong>Amritdhari:</strong> {formData.amritdhari}</div>}
                {formData.keshdhari && <div className="preview-field"><strong>Keshdhari:</strong> {formData.keshdhari}</div>}
                {formData.gurudwaraVisit && <div className="preview-field"><strong>Gurudwara Visit:</strong> {formData.gurudwaraVisit}</div>}

                {/* Family Details */}
                {(formData.fatherName || formData.fatherOccupation || formData.motherName || formData.motherOccupation || formData.siblings || formData.siblingsMarried || formData.familyType || formData.familyValues || formData.familyIncome || formData.nativePlace || formData.currentAddress) && (
                  <div className="preview-section-label" style={{ color: effectiveColor }}>Family Information</div>
                )}
                {formData.fatherName && <div className="preview-field"><strong>Father's Name:</strong> {formData.fatherName}</div>}
                {formData.fatherOccupation && <div className="preview-field"><strong>Father's Occupation:</strong> {formData.fatherOccupation}</div>}
                {formData.motherName && <div className="preview-field"><strong>Mother's Name:</strong> {formData.motherName}</div>}
                {formData.motherOccupation && <div className="preview-field"><strong>Mother's Occupation:</strong> {formData.motherOccupation}</div>}
                {formData.siblings && <div className="preview-field"><strong>Siblings:</strong> {formData.siblings}</div>}
                {formData.siblingsMarried && <div className="preview-field"><strong>Siblings Married:</strong> {formData.siblingsMarried}</div>}
                {formData.familyType && <div className="preview-field"><strong>Family Type:</strong> {formData.familyType}</div>}
                {formData.familyValues && <div className="preview-field"><strong>Family Values:</strong> {formData.familyValues}</div>}
                {formData.familyIncome && <div className="preview-field"><strong>Family Income:</strong> {formData.familyIncome}</div>}
                {formData.nativePlace && <div className="preview-field"><strong>Native Place:</strong> {formData.nativePlace}</div>}
                {formData.currentAddress && <div className="preview-field"><strong>Current Address:</strong> {formData.currentAddress}</div>}

                {/* Contact Information */}
                {(formData.phone || formData.email || formData.whatsapp || formData.address) && (
                  <div className="preview-section-label" style={{ color: effectiveColor }}>Contact Information</div>
                )}
                {formData.phone && <div className="preview-field"><strong>Phone:</strong> {formData.phone}</div>}
                {formData.email && <div className="preview-field"><strong>Email:</strong> {formData.email}</div>}
                {formData.whatsapp && <div className="preview-field"><strong>Alternate No:</strong> {formData.whatsapp}</div>}
                {formData.address && <div className="preview-field"><strong>Address:</strong> {formData.address}</div>}

                {/* Partner Preferences */}
                {(formData.partnerAgeRange || formData.partnerHeight || formData.partnerEducation || formData.partnerOccupation || formData.partnerLocation || formData.otherPreferences) && (
                  <div className="preview-section-label" style={{ color: effectiveColor }}>Partner Preferences</div>
                )}
                {formData.partnerAgeRange && <div className="preview-field"><strong>Partner Age Range:</strong> {formData.partnerAgeRange}</div>}
                {formData.partnerHeight && <div className="preview-field"><strong>Partner Height:</strong> {formData.partnerHeight}</div>}
                {formData.partnerEducation && <div className="preview-field"><strong>Partner Education:</strong> {formData.partnerEducation}</div>}
                {formData.partnerOccupation && <div className="preview-field"><strong>Partner Occupation:</strong> {formData.partnerOccupation}</div>}
                {formData.partnerLocation && <div className="preview-field"><strong>Partner Location:</strong> {formData.partnerLocation}</div>}
                {formData.otherPreferences && <div className="preview-field"><strong>Other Preferences:</strong> {formData.otherPreferences}</div>}

                {/* Empty state */}
                {Object.keys(formData).length === 0 && !photo && (
                  <div className="preview-empty">
                    <p>Start filling the form to see your biodata preview here</p>
                  </div>
                )}
              </div>
            </div> {/* preview-mini-content-wrap */}
            </div> {/* preview-inner-scroll */}
          </div> {/* biodata-preview-mini */}
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
