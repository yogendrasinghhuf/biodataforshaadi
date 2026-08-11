import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { legalContent } from '../data/legalContent';
import './LegalPage.css';

const LegalPage: React.FC = () => {
  const { pathname } = useLocation();
  const slug = pathname.replace('/', '');
  const content = legalContent[slug];

  if (!content) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="legal-page">
      <div className="legal-doc">
        <header className="legal-header">
          <h1 className="legal-title">{content.title}</h1>
          <p className="legal-updated">Last updated: {content.updated}</p>
          {content.intro && <p className="legal-intro">{content.intro}</p>}
        </header>

        {content.sections.map((section) => (
          <section key={section.heading} className="legal-section">
            <h2>{section.heading}</h2>
            {section.paragraphs?.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
            {section.bullets && (
              <ul className="legal-bullets">
                {section.bullets.map((bullet, i) => (
                  <li key={i}>{bullet}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
};

export default LegalPage;
