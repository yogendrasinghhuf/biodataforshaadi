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
  photoSrc?: string; // overrides the computed URL.createObjectURL(photo) src when provided (e.g. a cropped-image data URL)
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
  photoSrc,
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
                <img src={photoSrc || URL.createObjectURL(photo)} alt="Profile" />
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
