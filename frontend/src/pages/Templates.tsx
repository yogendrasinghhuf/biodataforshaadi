import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { templates, getOriginalPrice } from '../data/templates';
import '../components/TemplateCard.css';
import './Templates.css';

const generateBorderSVG = (color: string, templateId: string): string => {
  const encodedColor = encodeURIComponent(color);
  const svgPatterns: { [key: string]: string } = {
    'elegant-red': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter'><rect x='12' y='12' width='376' height='576' stroke-width='1.5'/><rect x='20' y='20' width='360' height='560' stroke-width='0.6'/></g></svg>`,
    'modern-green': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter'><rect x='14' y='14' width='372' height='572' stroke-width='2.5'/></g></svg>`,
    'golden-yellow': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter' stroke-linecap='square'><path stroke-width='1.5' d='M30,12 L370,12 M388,30 L388,570 M370,588 L30,588 M12,570 L12,30'/><path stroke-width='1.5' d='M30,12 L20,12 L20,22 L12,22 L12,30'/><path stroke-width='1.5' d='M370,12 L380,12 L380,22 L388,22 L388,30'/><path stroke-width='1.5' d='M388,570 L388,578 L380,578 L380,588 L370,588'/><path stroke-width='1.5' d='M12,570 L12,578 L20,578 L20,588 L30,588'/></g></svg>`,
    'festive-trio': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-width='2' stroke-linecap='square'><path d='M12,80 L12,12 L80,12'/><path d='M320,12 L388,12 L388,80'/><path d='M388,520 L388,588 L320,588'/><path d='M80,588 L12,588 L12,520'/><path d='M150,12 L250,12'/><path d='M150,588 L250,588'/><path d='M12,220 L12,380'/><path d='M388,220 L388,380'/></g></svg>`,
    'royal-red': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}'><rect x='14' y='14' width='372' height='572' stroke-width='1.5' stroke-dasharray='8 4'/></g></svg>`,
    'nature-green': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}'><rect x='14' y='14' width='372' height='572' rx='20' stroke-width='1.5'/><rect x='22' y='22' width='356' height='556' rx='14' stroke-width='0.6'/></g></svg>`,
    'luxury-gold': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter'><path stroke-width='1.5' d='M14,14 L185,14 L200,32 L215,14 L386,14 L386,285 L368,300 L386,315 L386,586 L215,586 L200,568 L185,586 L14,586 L14,315 L32,300 L14,285 Z'/></g></svg>`,
    'maroon-elegance': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linecap='square'><path stroke-width='2.5' d='M14,160 L14,14 L160,14'/><path stroke-width='2.5' d='M240,14 L386,14 L386,160'/><path stroke-width='2.5' d='M386,440 L386,586 L240,586'/><path stroke-width='2.5' d='M160,586 L14,586 L14,440'/><path stroke-width='0.8' d='M22,150 L22,22 L150,22'/><path stroke-width='0.8' d='M250,22 L378,22 L378,150'/><path stroke-width='0.8' d='M378,450 L378,578 L250,578'/><path stroke-width='0.8' d='M150,578 L22,578 L22,450'/></g></svg>`,
    'pink-blossom': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-width='1.5'><path d='M14,14 L14,586'/><path d='M386,14 L386,586'/><path d='M14,14 Q24,24 34,14 Q44,24 54,14 Q64,24 74,14 Q84,24 94,14 Q104,24 114,14 Q124,24 134,14 Q144,24 154,14 Q164,24 174,14 Q184,24 194,14 Q204,24 214,14 Q224,24 234,14 Q244,24 254,14 Q264,24 274,14 Q284,24 294,14 Q304,24 314,14 Q324,24 334,14 Q344,24 354,14 Q364,24 374,14 Q384,24 386,14'/><path d='M14,586 Q24,576 34,586 Q44,576 54,586 Q64,576 74,586 Q84,576 94,586 Q104,576 114,586 Q124,576 134,586 Q144,576 154,586 Q164,576 174,586 Q184,576 194,586 Q204,576 214,586 Q224,576 234,586 Q244,576 254,586 Q264,576 274,586 Q284,576 294,586 Q304,576 314,586 Q324,576 334,586 Q344,576 354,586 Q364,576 374,586 Q384,576 386,586'/></g></svg>`,
    'emerald-classic': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}'><rect x='14' y='14' width='372' height='572' stroke-width='1.5'/><rect x='26' y='26' width='348' height='548' rx='22' stroke-width='0.8'/></g></svg>`,
    'royal-blue': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-width='0.7'><rect x='12' y='12' width='376' height='576'/><rect x='16' y='16' width='368' height='568'/><rect x='20' y='20' width='360' height='560'/><rect x='24' y='24' width='352' height='552'/><rect x='28' y='28' width='344' height='544'/></g></svg>`,
    'crimson-rose': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linecap='round'><rect x='20' y='20' width='360' height='560' stroke-width='3' stroke-dasharray='0.5 17'/><rect x='33' y='33' width='334' height='534' stroke-width='0.8'/></g></svg>`,
    'peacock-green': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter'><rect x='16' y='16' width='368' height='568' stroke-width='2.5' stroke-dasharray='16 7'/></g><g fill='${encodedColor}'><path d='M16,5 L27,16 L16,27 L5,16 Z'/><path d='M384,5 L395,16 L384,27 L373,16 Z'/><path d='M16,573 L27,584 L16,595 L5,584 Z'/><path d='M384,573 L395,584 L384,595 L373,584 Z'/></g></svg>`,
    'amber-classic': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='M28,18 Q28,8 18,8 Q8,8 8,18 Q8,28 18,28 Q24,28 24,22 Q24,17 19,17'/><path d='M28,18 Q45,12 60,18 Q75,24 90,18 Q100,14 110,18'/><path stroke-width='1.2' d='M110,18 Q116,10 124,15 Q124,21 118,20'/><path d='M124,18 Q138,18 152,18'/><path d='M18,28 Q12,45 18,60 Q24,75 18,90 Q14,100 18,110'/><path stroke-width='1.2' d='M18,110 Q10,116 15,124 Q21,124 20,118'/><path d='M18,124 Q18,138 18,152'/><path d='M372,18 Q372,8 382,8 Q392,8 392,18 Q392,28 382,28 Q376,28 376,22 Q376,17 381,17'/><path d='M372,18 Q355,12 340,18 Q325,24 310,18 Q300,14 290,18'/><path stroke-width='1.2' d='M290,18 Q284,10 276,15 Q276,21 282,20'/><path d='M276,18 Q262,18 248,18'/><path d='M382,28 Q388,45 382,60 Q376,75 382,90 Q386,100 382,110'/><path stroke-width='1.2' d='M382,110 Q390,116 385,124 Q379,124 380,118'/><path d='M382,124 Q382,138 382,152'/><path d='M28,582 Q28,592 18,592 Q8,592 8,582 Q8,572 18,572 Q24,572 24,578 Q24,583 19,583'/><path d='M28,582 Q45,588 60,582 Q75,576 90,582 Q100,586 110,582'/><path stroke-width='1.2' d='M110,582 Q116,590 124,585 Q124,579 118,580'/><path d='M124,582 Q138,582 152,582'/><path d='M18,572 Q12,555 18,540 Q24,525 18,510 Q14,500 18,490'/><path stroke-width='1.2' d='M18,490 Q10,484 15,476 Q21,476 20,482'/><path d='M18,476 Q18,462 18,448'/><path d='M372,582 Q372,592 382,592 Q392,592 392,582 Q392,572 382,572 Q376,572 376,578 Q376,583 381,583'/><path d='M372,582 Q355,588 340,582 Q325,576 310,582 Q300,586 290,582'/><path stroke-width='1.2' d='M290,582 Q284,590 276,585 Q276,579 282,580'/><path d='M276,582 Q262,582 248,582'/><path d='M382,572 Q388,555 382,540 Q376,525 382,510 Q386,500 382,490'/><path stroke-width='1.2' d='M382,490 Q390,484 385,476 Q379,476 380,482'/><path d='M382,476 Q382,462 382,448'/></g><g fill='${encodedColor}'><circle cx='180' cy='18' r='3'/><circle cx='200' cy='18' r='4'/><circle cx='220' cy='18' r='3'/><circle cx='180' cy='582' r='3'/><circle cx='200' cy='582' r='4'/><circle cx='220' cy='582' r='3'/><circle cx='18' cy='260' r='2.5'/><circle cx='18' cy='300' r='3'/><circle cx='18' cy='340' r='2.5'/><circle cx='382' cy='260' r='2.5'/><circle cx='382' cy='300' r='3'/><circle cx='382' cy='340' r='2.5'/></g></svg>`,
    'royal-mandala': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}'><rect x='8' y='8' width='384' height='584' stroke-width='1.2' stroke-dasharray='0.5 4' stroke-linecap='round'/><rect x='16' y='16' width='368' height='568' stroke-width='2.2' stroke-dasharray='0.5 9' stroke-linecap='round'/><rect x='24' y='24' width='352' height='552' stroke-width='0.6'/></g></svg>`,
    'sapphire-classic': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter'><rect x='15' y='15' width='370' height='570' stroke-width='2'/><rect x='26' y='26' width='348' height='548' stroke-width='0.8'/></g><g fill='${encodedColor}'><rect x='5' y='5' width='18' height='18'/><rect x='377' y='5' width='18' height='18'/><rect x='5' y='577' width='18' height='18'/><rect x='377' y='577' width='18' height='18'/></g></svg>`,
  };
  const defaultPattern = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g stroke='${encodedColor}' stroke-width='2.5' fill='none'><path d='M5,5 L60,5 M5,5 L5,60 M395,5 L340,5 M395,5 L395,60 M5,595 L60,595 M5,595 L5,540 M395,595 L340,595 M395,595 L395,540 M80,5 L320,5 M80,595 L320,595 M5,100 L5,500 M395,100 L395,500'/></g></svg>`;
  const svgPattern = templateId in svgPatterns ? svgPatterns[templateId] : defaultPattern;
  if (!svgPattern) return 'none';
  return `url("data:image/svg+xml,${svgPattern}")`;
};

const Templates: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('default');

  const categories = ['all', 'Classic', 'Elegant', 'Royal'];

  const filteredTemplates = templates.filter(
    (template) => filter === 'all' || template.category === filter
  );

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return 0; // 'default' keeps original array order
  });

  const handleSelect = (templateId: string) => {
    navigate('/create', { state: { templateId } });
  };

  return (
    <div className="templates-page">
      <div className="container">
        <div className="page-header fade-in">
          <h1 className="page-title">Premium Templates</h1>
          <p className="page-subtitle">
            Choose from our collection of beautifully designed biodata templates
          </p>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label>Category:</label>
            <div className="filter-buttons">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`filter-btn ${filter === category ? 'active' : ''}`}
                  onClick={() => setFilter(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          <div className="sort-group">
            <label>Sort By:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="default">Default Order</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Templates Grid — same card structure as CreateBiodataNew gallery */}
        <div className="templates-page-grid">
          {sortedTemplates.map((tmpl, index) => (
            <div
              key={tmpl.id}
              className="template-card"
              onClick={() => handleSelect(tmpl.id)}
            >
              <div
                className={`template-preview-box border-template-${tmpl.id}`}
                style={{
                  background: tmpl.colors.background.toUpperCase() === '#FFFFFF' ? 'white' : tmpl.colors.background,
                  position: 'relative',
                }}
              >
                <img
                  className="template-card-border-img"
                  src={generateBorderSVG(tmpl.colors.primary, tmpl.id).replace(/^url\("/, '').replace(/"\)$/, '')}
                  alt=""
                  aria-hidden="true"
                />
                <div className="template-number-badge" style={{ backgroundColor: tmpl.colors.primary }}>
                  #{index + 1}
                </div>
                <div className="template-preview-content-centered">
                  <h4 className="template-name-inside" style={{ color: tmpl.colors.primary }}>
                    {tmpl.name}
                  </h4>
                  <div className="template-price-container">
                    <div className="template-price-row">
                      <span className="template-price-current">₹11</span>
                      <span className="template-price-original">₹{getOriginalPrice(tmpl.price)}</span>
                    </div>
                    <span className="template-discount-badge">
                      {Math.round((1 - 11 / getOriginalPrice(tmpl.price)) * 100)}% OFF
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {sortedTemplates.length === 0 && (
          <div className="no-results">
            <p>No templates found in this category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Templates;
