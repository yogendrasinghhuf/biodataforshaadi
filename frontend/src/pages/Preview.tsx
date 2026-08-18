import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// import axios from 'axios'; // Will be used when payment is enabled
import { getTemplateById, getOriginalPrice } from '../data/templates';
import { jsPDF } from 'jspdf';
import BiodataPage from '../components/BiodataPage';
import { getIconSvg } from '../data/godIcons';
import { renderBiodataPagePdf } from '../pdf/renderBiodataPagePdf';
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

  // Builds the PDF by drawing every element at a fixed millimetre coordinate (see
  // ../pdf/renderBiodataPagePdf), instead of screenshotting the live DOM and stretching that
  // image to fit the page. The old html2canvas approach derived the content layer's height from
  // the capture's own aspect ratio, which changed with how much the user filled in — so the
  // header and credit line landed in a different spot on a short biodata than a long one. Fixed
  // coordinates make that drift structurally impossible.
  const generatePDF = async () => {
    // Re-encodes an uploaded file (PNG/WEBP/JPEG/...) through a canvas to a PNG data URL.
    // jsPDF's addImage requires a data-URL/base64 string, never a raw Image element, and the
    // uploaded format isn't reliably JPEG, so normalising here avoids a format mismatch.
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
        // Runs whether the load succeeded or not, so a failed load never leaks the blob URL.
        URL.revokeObjectURL(objectUrl);
      }
    };

    let photoDataUrl: string | undefined;
    if (photo) {
      try {
        photoDataUrl = await loadPhotoAsDataUrl(photo);
      } catch (error) {
        // A broken profile photo must not abort the whole download.
        console.error('Skipping the profile photo:', error);
      }
    }

    // Each additional photo is loaded independently so one failure skips only that page,
    // leaving the main page and the other photos intact.
    const additionalPhotoDataUrls: string[] = [];
    for (const file of additionalPhotos) {
      try {
        additionalPhotoDataUrls.push(await loadPhotoAsDataUrl(file));
      } catch (error) {
        console.error('Skipping an additional photo page:', error);
      }
    }

    // compress: true runs the embedded images through Flate. Without it jsPDF stores the
    // rasterised border/photo PNGs uncompressed, which pushed a plain text-only biodata to
    // ~36MB; with it the same document is well under a megabyte.
    const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
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
      godIconSvg: showGaneshaIcon ? getIconSvg(selectedGodIcon) : undefined,
      additionalPhotoDataUrls,
    });

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
