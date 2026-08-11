# BiodataForShaadi — Complete Styles
> All CSS files. Pair with REQUIRED_SHAADI_SOURCE_CODE.md.

---

## `frontend/src/index.css`
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  /* Primary Colors - Red, Green, Yellow Theme */
  --primary-red: #DC2626;
  --primary-red-light: #FCA5A5;
  --primary-red-dark: #991B1B;

  --primary-green: #16A34A;
  --primary-green-light: #86EFAC;
  --primary-green-dark: #166534;

  --primary-yellow: #EAB308;
  --primary-yellow-light: #FDE047;
  --primary-yellow-dark: #A16207;

  /* Accent Colors */
  --accent-orange: #F97316;
  --accent-gold: #D97706;

  /* Neutral Colors */
  --white: #FFFFFF;
  --gray-50: #F9FAFB;
  --gray-100: #F3F4F6;
  --gray-200: #E5E7EB;
  --gray-300: #D1D5DB;
  --gray-400: #9CA3AF;
  --gray-500: #6B7280;
  --gray-600: #4B5563;
  --gray-700: #374151;
  --gray-800: #1F2937;
  --gray-900: #111827;

  /* Gradients */
  --gradient-primary: linear-gradient(135deg, var(--primary-red) 0%, var(--primary-yellow) 50%, var(--primary-green) 100%);
  --gradient-warm: linear-gradient(135deg, var(--primary-red) 0%, var(--accent-orange) 100%);
  --gradient-fresh: linear-gradient(135deg, var(--primary-yellow) 0%, var(--primary-green) 100%);

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-base: 300ms ease-in-out;
  --transition-slow: 500ms ease-in-out;
}

body {
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--gray-50);
  color: var(--gray-900);
  line-height: 1.6;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: var(--gray-100);
}

::-webkit-scrollbar-thumb {
  background: var(--primary-red);
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--primary-red-dark);
}

/* Utility Classes */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.text-gradient {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-decoration: none;
}

.btn-primary {
  background: var(--gradient-warm);
  color: var(--white);
  box-shadow: var(--shadow-md);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
}

.btn-success {
  background: var(--primary-green);
  color: var(--white);
  box-shadow: var(--shadow-md);
}

.btn-success:hover {
  background: var(--primary-green-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
}

.btn-warning {
  background: var(--primary-yellow);
  color: var(--gray-900);
  box-shadow: var(--shadow-md);
}

.btn-warning:hover {
  background: var(--primary-yellow-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
}

.card {
  background: var(--white);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
}

.card:hover {
  box-shadow: var(--shadow-lg);
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.fade-in {
  animation: fadeIn 0.5s ease-out;
}

.slide-in {
  animation: slideIn 0.5s ease-out;
}

```

## `frontend/src/App.css`
```css
.App {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}

```

## `frontend/src/components/Header.css`
```css
.header {
  background: var(--white);
  box-shadow: var(--shadow-md);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}

.logo {
  text-decoration: none;
}

.logo-text {
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 8px;
  color: var(--gray-700);
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 32px;
  align-items: center;
  margin: 0;
  padding: 0;
}

.nav-link {
  text-decoration: none;
  color: var(--gray-700);
  font-weight: 600;
  font-size: 1rem;
  transition: color var(--transition-fast);
  position: relative;
}

.nav-link:hover {
  color: var(--primary-red);
}

.nav-link.active {
  color: var(--primary-red);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--gradient-warm);
}

.nav-btn {
  padding: 10px 20px;
  font-size: 0.875rem;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .mobile-menu-btn {
    display: block;
  }

  .nav-links {
    position: fixed;
    top: 68px;
    left: 0;
    right: 0;
    background: var(--white);
    flex-direction: column;
    padding: 24px 20px;
    box-shadow: var(--shadow-lg);
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all var(--transition-base);
    gap: 16px;
  }

  .nav-links.mobile-open {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }

  .nav-link.active::after {
    display: none;
  }

  .nav-btn {
    width: 100%;
  }
}

```

## `frontend/src/components/Footer.css`
```css
.footer {
  background: var(--gray-900);
  color: var(--gray-300);
  padding: 60px 0 20px;
  margin-top: 80px;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
  margin-bottom: 40px;
}

.footer-section h3,
.footer-section h4 {
  color: var(--white);
  margin-bottom: 20px;
}

.footer-logo {
  font-size: 1.5rem;
  font-weight: 800;
}

.footer-description {
  line-height: 1.6;
  max-width: 300px;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 12px;
}

.footer-links a {
  color: var(--gray-300);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.footer-links a:hover {
  color: var(--white);
}

.footer-bottom {
  border-top: 1px solid var(--gray-700);
  padding-top: 24px;
  text-align: center;
}

.footer-bottom p {
  margin: 8px 0;
  font-size: 0.875rem;
}

.footer-tagline {
  color: var(--gray-400);
}

.footer-ssl {
  color: var(--gray-500);
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}

```

## `frontend/src/components/TemplateCard.css`
```css
/* Shared template gallery card styles — used by CreateBiodataNew's in-form gallery and the standalone Templates page */

.template-card {
  border: 2px solid var(--gray-300);
  border-radius: 12px;
  cursor: pointer;
  transition: all var(--transition-base);
  overflow: hidden;
  position: relative;
  background: var(--white);
  box-shadow: var(--shadow-md);
}

.template-card:hover {
  border-color: var(--primary-red);
  box-shadow: var(--shadow-xl);
  transform: translateY(-6px);
}

.template-card.selected {
  border-color: var(--primary-green);
  box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.2);
  transform: translateY(-4px);
}

.template-preview-box {
  height: 250px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  position: relative;
  margin: 6px;
  border-radius: 8px;
  padding: 12px 8px;
  overflow: visible;
}

.template-preview-box::before {
  display: none;
}

.template-card-border-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  object-fit: fill;
}

.template-preview-content-centered {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  z-index: 2;
  width: 80%;
}

.template-name-inside {
  font-size: 0.9rem;
  font-weight: 700;
  margin: 0 0 6px 0;
  line-height: 1.3;
}

.template-price-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.template-price-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.template-price-original {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--gray-500);
  text-decoration: line-through;
}

.template-price-current {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--gray-900);
}

.template-discount-badge {
  font-size: 0.65rem;
  font-weight: 700;
  background: linear-gradient(135deg, #16A34A 0%, #15803D 100%);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.template-number-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
  z-index: 3;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.selected-check-large {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  background: var(--primary-green);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  box-shadow: var(--shadow-lg);
  z-index: 10;
}

/* Dark Royal templates — gallery card name + price must be light on the dark preview box */
.border-template-sapphire-classic .template-name-inside,
.border-template-crimson-rose .template-name-inside,
.border-template-peacock-green .template-name-inside,
.border-template-amber-classic .template-name-inside,
.border-template-royal-mandala .template-name-inside,
.border-template-sapphire-classic .template-price-current,
.border-template-crimson-rose .template-price-current,
.border-template-peacock-green .template-price-current,
.border-template-amber-classic .template-price-current,
.border-template-royal-mandala .template-price-current,
.border-template-sapphire-classic .template-price-original,
.border-template-crimson-rose .template-price-original,
.border-template-peacock-green .template-price-original,
.border-template-amber-classic .template-price-original,
.border-template-royal-mandala .template-price-original {
  color: #E8C77A !important;
}

```

## `frontend/src/pages/Home.css`
```css
/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.05) 0%, rgba(234, 179, 8, 0.05) 50%, rgba(22, 163, 74, 0.05) 100%);
  padding: 80px 0 60px;
  min-height: 70vh;
  display: flex;
  align-items: center;
}

.hero-content {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 24px;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--gray-600);
  margin-bottom: 40px;
  line-height: 1.6;
}

.hero-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-large {
  padding: 16px 32px;
  font-size: 18px;
}

.btn-outline {
  background: transparent;
  border: 2px solid var(--primary-red);
  color: var(--primary-red);
}

.btn-outline:hover {
  background: var(--primary-red);
  color: var(--white);
}

/* Stats Section */
.stats-section {
  padding: 60px 0;
  background: var(--white);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 32px;
  max-width: 1000px;
  margin: 0 auto;
}

.stat-card {
  text-align: center;
  padding: 24px;
}

.stat-number {
  font-size: 3rem;
  font-weight: 800;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 1rem;
  color: var(--gray-600);
  font-weight: 500;
}

.stat-tag {
  font-size: 0.8rem;
  font-style: italic;
  color: var(--primary-red);
  font-weight: 600;
  margin-top: 4px;
}

/* Features Section */
.features-section {
  padding: 80px 0;
  background: var(--gray-50);
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 60px;
  color: var(--gray-900);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
}

.feature-card {
  text-align: center;
  padding: 32px 20px;
  transition: transform var(--transition-base);
}

.feature-card:hover {
  transform: translateY(-8px);
}

.feature-icon {
  font-size: 2.25rem;
  margin-bottom: 14px;
}

.feature-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--gray-900);
}

.feature-description {
  color: var(--gray-600);
  line-height: 1.55;
  font-size: 0.9rem;
}

/* How It Works Section */
.how-it-works-section {
  padding: 80px 0;
  background: var(--white);
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 32px;
  max-width: 1000px;
  margin: 0 auto;
}

.step-card {
  text-align: center;
  padding: 32px 20px;
  position: relative;
}

.step-number {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--gradient-warm);
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 auto 20px;
  box-shadow: var(--shadow-lg);
}

.step-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--gray-900);
}

.step-card p {
  color: var(--gray-600);
  line-height: 1.6;
}

/* CTA Section */
.cta-section {
  padding: 80px 0;
  background: linear-gradient(135deg, var(--primary-red) 0%, var(--accent-orange) 100%);
  color: var(--white);
}

.cta-content {
  text-align: center;
  max-width: 700px;
  margin: 0 auto;
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
}

.cta-text {
  font-size: 1.25rem;
  margin-bottom: 32px;
  opacity: 0.95;
}

/* Responsive Design */
@media (max-width: 1100px) {
  .features-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .cta-title {
    font-size: 2rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .steps-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
}

```

## `frontend/src/pages/Templates.css`
```css
.templates-page {
  padding: 40px 0 80px;
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 60px;
  padding-top: 20px;
}

.page-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 16px;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 1.25rem;
  color: var(--gray-600);
}

/* Filters */
.filters-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  gap: 24px;
  flex-wrap: wrap;
  padding: 24px;
  background: var(--white);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
}

.filter-group,
.sort-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-group label,
.sort-group label {
  font-weight: 600;
  color: var(--gray-700);
}

.filter-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 16px;
  border: 2px solid var(--gray-300);
  background: var(--white);
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--gray-700);
}

.filter-btn:hover {
  border-color: var(--primary-red);
  color: var(--primary-red);
}

.filter-btn.active {
  background: var(--gradient-warm);
  border-color: var(--primary-red);
  color: var(--white);
}

.sort-select {
  padding: 8px 16px;
  border: 2px solid var(--gray-300);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  background: var(--white);
  cursor: pointer;
  transition: border-color var(--transition-fast);
}

.sort-select:focus {
  outline: none;
  border-color: var(--primary-red);
}

/* Templates Grid */
.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 32px;
  margin-top: 32px;
}

/* .template-card, .template-card:hover → shared in ../components/TemplateCard.css */

/* Override grid columns for the templates browsing page (wider than the create-page gallery) */
.templates-page-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 28px;
  margin-top: 24px;
}

.templates-page-grid .template-preview-box {
  height: auto;
  aspect-ratio: 2 / 3;
}

.templates-page-grid .template-name-inside {
  font-size: 1.1rem;
}

.templates-page-grid .template-price-current {
  font-size: 1.3rem;
}

/* Unused legacy card markup removed: .tpl-*, .template-info, .template-header, .template-name,
   .template-category, .template-description, .template-footer, .template-price, .price-amount
   — none referenced by current Templates.tsx JSX. */

.no-results {
  text-align: center;
  padding: 80px 20px;
  color: var(--gray-500);
  font-size: 1.25rem;
}

/* Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }

  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group,
  .sort-group {
    flex-direction: column;
    align-items: stretch;
  }

  .templates-grid {
    grid-template-columns: 1fr;
  }
}

```

## `frontend/src/pages/Preview.css`
```css
.preview-page {
  padding: 40px 0 80px;
  min-height: 100vh;
}

/* Success Screen */
.success-screen {
  max-width: 600px;
  margin: 40px auto;
  text-align: center;
}

.success-icon {
  width: 100px;
  height: 100px;
  background: var(--primary-green);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  font-weight: bold;
  margin: 0 auto 24px;
  box-shadow: var(--shadow-xl);
  animation: successPop 0.5s ease-out;
}

@keyframes successPop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.success-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--gray-900);
  margin-bottom: 12px;
}

.success-message {
  font-size: 1.125rem;
  color: var(--gray-600);
  margin-bottom: 32px;
}

.success-card {
  text-align: left;
  padding: 32px;
}

.success-card h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 20px;
  text-align: center;
}

.order-details {
  margin-bottom: 24px;
}

.order-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--gray-200);
  font-size: 1rem;
}

.order-value {
  font-weight: 700;
  color: var(--gray-900);
}

.status-paid {
  color: var(--primary-green);
  background: rgba(22, 163, 74, 0.1);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
}

.download-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 2px solid var(--gray-200);
  text-align: center;
}

.download-note {
  font-size: 0.875rem;
  color: var(--gray-600);
  margin-top: 12px;
  font-style: italic;
}

.back-button {
  margin-bottom: 20px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.preview-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  align-items: start;
  gap: 32px;
  margin-top: 40px;
}

/* Biodata Preview card — holds border overlay + scroll area */
.biodata-preview-card {
  position: relative;
  border-radius: 16px;
  background: white;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05),
    inset 0 2px 4px 0 rgba(0, 0, 0, 0.02);
  overflow: hidden;
  padding: 0;
}

/* SVG border pinned to card edges — always fully visible, never scrolls */
.biodata-border-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: center;
  background-image: var(--border-image);
}

/* Scrollable area inside the card */
.biodata-preview-scroll {
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 700px;
  position: relative;
  z-index: 1;
}

/* Preview page sizing — scoped to preview-layout so it doesn't bleed into CreateBiodataNew */
/* Outer wrapper carries the scrollbar; the bordered box itself never scrolls, so the border never overlaps the scrollbar track */
.preview-layout .preview-scroll-wrapper {
  max-width: 650px;
  width: 100%;
  margin: 0;
  height: calc(100vh - 180px);
  min-height: 794px;
  max-height: 1350px;
  overflow-y: scroll;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: #16A34A #e5e7eb;
}

.preview-layout .preview-scroll-wrapper::-webkit-scrollbar {
  width: 6px;
}

.preview-layout .preview-scroll-wrapper::-webkit-scrollbar-track {
  background: #e5e7eb;
  border-radius: 3px;
}

.preview-layout .preview-scroll-wrapper::-webkit-scrollbar-thumb {
  background: #16A34A;
  border-radius: 3px;
}

.preview-layout .preview-scroll-wrapper::-webkit-scrollbar-thumb:hover {
  background: #166534;
}

.preview-layout .biodata-preview-mini {
  background: var(--white);
  width: 100%;
  min-height: 100%;
  display: block;
}

.preview-layout .preview-inner-scroll {
  overflow: visible;
}

/* Content wrap inside preview-inner-scroll — padding scaled to match the mini-preview's proportion (22px at 360px wide) at this box's larger 650px width */
.preview-mini-content-wrap {
  padding: 40px;
  display: flex;
  flex-direction: column;
  min-height: 500px;
}


/* Payment Card */
.payment-card {
  position: sticky;
  top: 20px;
  height: fit-content;
  padding: 16px;
  border: 3px solid transparent;
  background-image:
    linear-gradient(white, white),
    linear-gradient(135deg, var(--primary-red), var(--primary-yellow), var(--primary-green));
  background-origin: padding-box, border-box;
  background-clip: padding-box, border-box;
  border-radius: 16px;
  box-shadow: var(--shadow-xl);
}

.payment-eyebrow {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--gray-500);
  margin-bottom: 10px;
}

.payment-template-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.payment-template-swatch {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.04);
}

.payment-template-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--gray-900);
}

.payment-details {
  margin-bottom: 12px;
}

.payment-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  color: var(--gray-600);
  font-size: 0.9rem;
}

.payment-value {
  font-weight: 600;
  color: var(--gray-900);
}

.payment-row.total {
  font-size: 1rem;
  font-weight: 700;
  color: var(--gray-900);
  align-items: center;
}

.payment-offer-note {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: -2px;
}

.payment-offer-badge {
  font-size: 0.8rem;
  font-weight: 800;
  color: white;
  background: linear-gradient(135deg, #16A34A 0%, #15803D 100%);
  padding: 4px 10px;
  border-radius: 6px;
  letter-spacing: 0.3px;
}

.payment-offer-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--primary-green-dark);
}

.payment-amount {
  font-size: 1.5rem;
  font-weight: 800;
  margin-right: 8px;
  background: var(--gradient-warm);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.payment-amount-original {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--gray-400);
  text-decoration: line-through;
}

.btn-full {
  width: 100%;
  font-size: 1.125rem;
  padding: 11px;
}

.payment-info {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--gray-200);
}

.payment-info p {
  font-size: 0.875rem;
  color: var(--gray-600);
  margin: 5px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

/* Responsive */
@media (max-width: 968px) {
  .preview-layout {
    grid-template-columns: 1fr;
  }

  .payment-card {
    position: static;
  }

  .biodata-preview-scroll {
    max-height: 60vh;
  }

  .preview-field strong {
    min-width: 80px;
    font-size: 0.7rem;
  }
}

/* Template border styles, header, field, name-title rules now in biodata-preview-shared.css */

```

## `frontend/src/pages/CreateBiodataNew.css`
```css
.create-biodata-new-page {
  background: var(--gray-50);
  min-height: 100vh;
  padding: 40px 20px;
}

.create-container {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 32px;
}

/* Form Section */
.form-section {
  background: transparent;
}

.form-header {
  margin-bottom: 32px;
}

.form-title {
  font-size: 2.5rem;
  font-weight: 800;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.form-subtitle {
  font-size: 1.125rem;
  color: var(--gray-600);
}

.form-section-card {
  background: var(--white);
  border-radius: 16px;
  padding: 30px 32px 32px 32px;
  margin-bottom: 24px;
  box-shadow: var(--shadow-md);
  transition: box-shadow var(--transition-base);
}

.form-section-card:hover {
  box-shadow: var(--shadow-lg);
}

.section-header-with-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-heading {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-icon {
  font-size: 1.75rem;
}

.btn-clear {
  padding: 8px 16px;
  background: var(--white);
  border: 2px solid var(--primary-red);
  color: var(--primary-red);
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-clear:hover {
  background: var(--primary-red);
  color: var(--white);
  transform: translateY(-2px);
}

/* Religion Selection */
.religion-grid-compact {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.religion-btn {
  padding: 16px 12px;
  background: var(--white);
  border: 2px solid var(--gray-300);
  border-radius: 12px;
  cursor: pointer;
  transition: all var(--transition-base);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-700);
}

.religion-btn:hover {
  border-color: var(--primary-red);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.religion-btn.selected {
  border-color: var(--primary-red);
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(234, 179, 8, 0.1) 100%);
  box-shadow: var(--shadow-md);
}

.rel-icon {
  font-size: 2rem;
}

/* Header Toggles */
.header-toggles {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.toggle-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--white);
  border: 2px solid var(--gray-200);
  border-radius: 8px;
  transition: all var(--transition-base);
  position: relative;
  flex-wrap: wrap;
  min-height: 50px;
  height: 50px;
}

.toggle-item:hover {
  border-color: var(--gray-300);
  box-shadow: var(--shadow-sm);
}

.toggle-switch {
  position: relative;
  width: 44px;
  height: 22px;
  flex-shrink: 0;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--gray-300);
  transition: 0.3s;
  border-radius: 22px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.toggle-switch input:checked + .toggle-slider {
  background-color: var(--primary-green);
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(22px);
}

.toggle-content {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.toggle-icon {
  font-size: 1.2rem;
}

.toggle-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-800);
}

.toggle-text {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--gray-600);
  font-family: serif;
  letter-spacing: 0.5px;
}

.toggle-text-bold {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--gray-900);
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.toggle-text-input {
  flex: 1;
  border: 1px solid var(--gray-300);
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--gray-700);
  font-family: serif;
  letter-spacing: 0.5px;
  transition: all var(--transition-base);
}

.toggle-text-input:focus {
  outline: none;
  border-color: var(--primary-green);
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
}

.toggle-text-input-bold {
  flex: 1;
  border: 1px solid var(--gray-300);
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--gray-900);
  letter-spacing: 1.5px;
  text-transform: uppercase;
  transition: all var(--transition-base);
}

.toggle-text-input-bold:focus {
  outline: none;
  border-color: var(--primary-green);
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
}

.edit-icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 4px 6px;
  border-radius: 4px;
  transition: all var(--transition-base);
  flex-shrink: 0;
  opacity: 0.6;
}

.edit-icon-btn:hover {
  background: var(--gray-100);
  opacity: 1;
  transform: scale(1.1);
}

.edit-icon-btn:active {
  transform: scale(0.95);
}

.change-icon-btn {
  background: var(--gray-100);
  border: 1px solid var(--gray-300);
  color: var(--gray-700);
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 4px;
  transition: all var(--transition-base);
  margin-left: auto;
}

.change-icon-btn:hover {
  background: var(--gray-200);
  border-color: var(--gray-400);
}

.change-icon-btn:active {
  transform: scale(0.95);
}

.change-icon-btn-styled {
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all var(--transition-base);
}

.change-icon-btn-styled:hover {
  background: rgba(59, 130, 246, 0.1);
}

.change-icon-btn-styled:active {
  transform: scale(0.95);
}

.pencil-icon {
  font-size: 0.9rem;
}

.change-text {
  color: #3B82F6;
  font-size: 0.875rem;
  font-weight: 500;
}

.toggle-icon-large {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  vertical-align: middle;
}

.toggle-icon-large svg {
  width: 100%;
  height: 100%;
  display: block;
}

.icon-picker-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: var(--white);
  border: 2px solid var(--gray-300);
  border-radius: 8px;
  box-shadow: var(--shadow-xl);
  padding: 12px;
  padding-top: 28px;
  z-index: 1000;
  animation: slideDown 0.2s ease-out;
}

.icon-picker-close {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 22px;
  height: 22px;
  background: var(--gray-200);
  border: 1px solid var(--gray-400);
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--gray-900);
  cursor: pointer;
  padding: 0;
  border-radius: 50%;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.icon-picker-close:hover {
  color: white;
  background: #9F1239;
  border-color: #9F1239;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.icon-picker-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.icon-option {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--white);
  border: 2px solid var(--gray-200);
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.5rem;
  line-height: 1;
  padding: 4px;
  transition: all var(--transition-base);
}

.icon-option svg {
  width: 100%;
  height: 100%;
  display: block;
}

.icon-option:hover {
  border-color: var(--primary-green);
  background: var(--gray-50);
  transform: scale(1.1);
}

.icon-option.selected {
  border-color: var(--primary-green);
  background: rgba(22, 163, 74, 0.1);
  box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.2);
}

/* Form Fields */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: 6px;
}

.required {
  color: var(--primary-red);
  margin-left: 4px;
}

.form-input {
  padding: 10px 14px;
  border: 2px solid var(--gray-300);
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all var(--transition-fast);
  background: var(--white);
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-red);
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.form-input::placeholder {
  color: var(--gray-400);
}

/* Symbol Selection */
.symbol-selection {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 2px solid var(--gray-200);
}

.symbol-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
}

.symbol-header-row .form-label {
  margin-bottom: 0;
}

.btn-clear-symbol {
  padding: 6px 12px;
  background: var(--white);
  border: 2px solid var(--gray-400);
  color: var(--gray-700);
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-clear-symbol:hover {
  background: var(--gray-100);
  border-color: var(--gray-600);
  transform: translateY(-1px);
}

.symbol-grid {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.symbol-btn {
  padding: 10px;
  min-width: 50px;
  background: var(--white);
  border: 2px solid var(--gray-300);
  border-radius: 8px;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all var(--transition-base);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.symbol-btn:hover {
  border-color: var(--primary-yellow);
  transform: scale(1.1);
  box-shadow: var(--shadow-md);
}

.symbol-btn.selected {
  border-color: var(--primary-green);
  background: var(--primary-green-light);
  box-shadow: var(--shadow-lg);
  transform: scale(1.15);
}

/* Photo Upload Compact */
.photo-upload-compact {
  max-width: none;
}

.photo-input {
  display: none;
}

.photo-upload-label {
  display: block;
  cursor: pointer;
  border: 2px dashed var(--gray-300);
  border-radius: 12px;
  overflow: hidden;
  transition: all var(--transition-base);
}

.photo-upload-label:hover {
  border-color: var(--primary-red);
}

.photo-preview-small {
  position: relative;
  width: 100%;
  max-width: 240px;
  aspect-ratio: 3 / 4;
  margin: 0 auto;
}

.photo-clear-button {
  padding: 8px 18px;
  background: white;
  border: 2px solid #9F1239;
  color: #9F1239;
  border-radius: 22px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.photo-clear-button:hover {
  background: #9F1239;
  color: white;
}

/* Two shape-preview cards (rectangle + circle) with radio selection */
.photo-shape-row {
  display: flex;
  gap: 32px;
  justify-content: center;
  align-items: stretch;
  flex-wrap: wrap;
}

.photo-shape-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  width: 240px;
  border: 2px solid var(--gray-200);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
  position: relative;
}

.photo-shape-card:hover {
  border-color: var(--gray-400);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.photo-shape-card.selected {
  border-color: #16A34A;
  box-shadow: 0 0 0 1px #16A34A, 0 4px 10px rgba(22, 163, 74, 0.18);
}

.photo-shape-radio {
  position: absolute;
  top: 12px;
  right: 12px;
  margin: 0;
  cursor: pointer;
  accent-color: #16A34A;
  width: 18px;
  height: 18px;
}

.photo-preview-shape {
  width: 190px;
  overflow: hidden;
  background: var(--gray-100);
}

.photo-preview-shape.rectangle {
  aspect-ratio: 3 / 4;
  border-radius: 8px;
}

.photo-preview-shape.circle {
  aspect-ratio: 1 / 1;
  border-radius: 50%;
}

.photo-preview-shape img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  display: block;
}

.photo-shape-label-text {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-700);
}

.photo-shape-card.selected .photo-shape-label-text {
  color: #16A34A;
}

/* Action buttons row below the shape previews */
.photo-actions-row {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 16px;
  flex-wrap: wrap;
}

.photo-change-button {
  padding: 8px 18px;
  background: white;
  border: 2px solid #16A34A;
  color: #16A34A;
  border-radius: 22px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
}

.photo-change-button:hover {
  background: #16A34A;
  color: white;
}

.photo-preview-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  display: block;
}

.change-photo {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  text-align: center;
  padding: 8px;
  font-size: 0.875rem;
  font-weight: 600;
}

.photo-placeholder-small {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  color: var(--gray-500);
  gap: 12px;
}

.photo-icon {
  font-size: 3rem;
}

/* Full Width Templates Section */
.templates-full-width-section {
  width: 100%;
  background: var(--white);
  padding: 40px 20px;
  margin-top: 40px;
  border-radius: 16px;
  box-shadow: var(--shadow-md);
}

.templates-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* Template Grid Large */
.template-grid-large {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  margin-top: 24px;
}

/* .template-card, .template-card:hover, .template-card.selected, .template-preview-box → shared in ../components/TemplateCard.css */

.template-preview-content {
  text-align: left;
  width: 100%;
  font-size: 0.65rem;
  line-height: 1.8;
}

.preview-sample-name {
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 8px;
  text-align: center;
  padding-bottom: 4px;
}

.preview-sample-field {
  color: var(--gray-600);
  padding: 2px 0;
  font-size: 0.6rem;
}

/* .template-preview-box::before, .template-card-border-img → shared in ../components/TemplateCard.css */

/* Ensure content is above the border */
.template-preview-content {
  position: relative;
  z-index: 2;
}

/* .template-preview-content-centered, .template-name-inside, .template-price-container,
   .template-price-row, .template-price-original, .template-price-current,
   .template-discount-badge, .template-number-badge → shared in ../components/TemplateCard.css */

.preview-icon {
  font-size: 3.5rem;
  margin-bottom: 12px;
  opacity: 0.9;
}

.preview-text {
  font-size: 1.125rem;
  font-weight: 600;
  opacity: 0.95;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.template-card-footer {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--white);
}

.template-info {
  flex: 1;
}

.template-card-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0 0 4px 0;
}

.template-category {
  font-size: 0.875rem;
  color: var(--gray-600);
  margin: 0;
}

.template-card-price {
  font-size: 1.5rem;
  font-weight: 800;
  background: var(--gradient-warm);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

/* .selected-check-large → shared in ../components/TemplateCard.css */

/* Submit Button */
.btn-submit {
  width: 100%;
  margin-top: 16px;
  font-size: 0.9rem;
  padding: 12px 16px;
  height: 68px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.preview-pay-btn {
  width: 100%;
  margin-top: 0;
  font-size: 0.9rem;
  padding: 10px 16px;
  height: auto;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 4px;
}

.btn-submit-text {
  font-weight: 700;
  font-size: 1rem;
  line-height: 1.2;
  text-align: center;
}

.btn-submit-price {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-submit .btn-price-current {
  font-size: 1.1rem;
  font-weight: 700;
}

.btn-submit .btn-price-original {
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: line-through;
  opacity: 0.8;
}

/* Preview Section */
.preview-section {
  position: relative;
  /* Grid default (align-items: stretch) makes this column match the form's height,
     so the sticky preview inside stays sticky all the way down to the bottom
     "Preview & Download" button without the old magic-number min-height hack. */
}

.preview-sticky {
  position: sticky;
  top: 100px;
  width: 380px;
  height: fit-content;
  overflow-y: hidden;
  overflow-x: visible;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding-bottom: 20px;
}

/* Scrollbar for preview sticky */
.preview-sticky::-webkit-scrollbar {
  width: 8px;
}

.preview-sticky::-webkit-scrollbar-track {
  background: var(--gray-100);
  border-radius: 4px;
}

.preview-sticky::-webkit-scrollbar-thumb {
  background: var(--gray-400);
  border-radius: 4px;
}

.preview-sticky::-webkit-scrollbar-thumb:hover {
  background: var(--gray-500);
}

.preview-actions {
  margin-top: 8px;
  margin-bottom: 0;
  flex-shrink: 0;
  flex-grow: 0;
  position: relative;
  z-index: 10;
}

.preview-buttons-row {
  display: flex;
  gap: 12px;
  align-items: stretch;
  position: relative;
}

.preview-buttons-row > * {
  margin: 0 !important;
  padding-top: 12px !important;
  padding-bottom: 12px !important;
  position: relative !important;
  top: 0 !important;
}

.clear-form-btn {
  flex: 1;
  background: white !important;
  color: #9F1239 !important;
  border: 2px solid #9F1239 !important;
  font-weight: 700;
  font-size: 0.9rem;
  padding: 12px 16px;
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.2s;
  height: auto;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  margin: 0;
  line-height: 1.2;
}

.clear-form-btn:hover {
  background: #FFF1F2 !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.preview-download-btn {
  flex: 2;
  background: linear-gradient(135deg, #9F1239, #BE123C) !important;
  color: white !important;
  border: none !important;
  font-weight: 700;
  padding: 14px 20px;
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(159, 18, 57, 0.3);
}

.preview-download-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(159, 18, 57, 0.4);
}

.template-info-box {
  text-align: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--gray-200);
}

.template-name-label {
  font-size: 0.75rem;
  color: var(--gray-600);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.template-name-with-price {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0;
  line-height: 1.4;
}

.preview-pay-btn {
  flex: 2;
  background: linear-gradient(135deg, #16A34A, #15803D) !important;
  color: white !important;
  border: 2px solid transparent !important;
  font-weight: 700;
  font-size: 0.9rem;
  padding: 11px 16px;
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
  height: auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4px;
  white-space: nowrap;
  margin: 0;
  line-height: 1.2;
}

.preview-pay-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(22, 163, 74, 0.4);
}

.preview-pay-btn .btn-submit-text {
  font-size: 0.9rem;
  line-height: 1;
  text-align: center;
  margin: 0;
  padding: 0;
}

.preview-pay-btn .btn-submit-price {
  gap: 6px;
  margin: 0;
  padding: 0;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-pay-btn .btn-price-current {
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1;
  margin: 0;
  padding: 0;
}

.preview-pay-btn .btn-price-original {
  font-size: 0.8rem;
  line-height: 1;
  margin: 0;
  padding: 0;
}

.preview-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 8px;
  text-align: center;
  flex-shrink: 0;
  background: var(--white);
  padding: 8px;
  border-radius: 12px;
  box-shadow: var(--shadow-md);
}

.preview-title-main {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 12px;
  text-align: center;
  flex-shrink: 0;
}

.preview-info-text {
  font-size: 0.8rem;
  color: #92400E;
  background: #FEF3C7;
  padding: 8px;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 8px;
  flex-shrink: 0;
  line-height: 1.4;
}

/* Pickers Container - Side by Side */
.pickers-container {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  flex-shrink: 0;
}

/* Color Picker Section */
.color-picker-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px;
  background: var(--white);
  border-radius: 8px;
  box-shadow: var(--shadow-md);
  flex: 1;
}

.color-picker-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--gray-700);
  white-space: nowrap;
  text-align: center;
}

/* Header Color row inside the Customize Header section */
.header-color-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 12px;
  background: var(--white);
  border: 2px solid var(--gray-200);
  border-radius: 8px;
  transition: all var(--transition-base);
  height: 50px;
  min-height: 50px;
  box-sizing: border-box;
}

.header-color-row:hover {
  border-color: var(--gray-300);
  box-shadow: var(--shadow-sm);
}

.header-color-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--gray-700);
}

/* Inline Reset-to-Default button next to Customize */
.color-reset-inline-btn {
  padding: 5px 11px;
  background: white;
  border: 1.5px solid #9F1239;
  color: #9F1239;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.color-reset-inline-btn:hover {
  background: #FFF1F2;
}

/* Compact button that opens the color popup */
.color-customize-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 13px;
  background: var(--white);
  border: 1.5px solid var(--gray-300);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--gray-700);
  transition: all 0.2s;
}

.color-customize-btn:hover {
  border-color: var(--gray-500);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.color-customize-swatch {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}

/* Header color popup modal */
.color-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.color-modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

.color-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--gray-200);
}

.color-modal-header h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0;
}

.color-modal-close {
  background: none;
  border: none;
  font-size: 1.35rem;
  color: var(--gray-500);
  cursor: pointer;
  padding: 2px 8px;
  line-height: 1;
  border-radius: 6px;
  transition: all 0.2s;
}

.color-modal-close:hover {
  color: var(--gray-900);
  background: var(--gray-100);
}

.color-modal-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 20px;
}

.color-modal-swatch {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 10px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  color: white;
  font-weight: bold;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.color-modal-swatch:hover {
  transform: scale(1.08);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
}

.color-modal-swatch.selected {
  border-color: var(--gray-900);
  box-shadow: 0 0 0 2px white, 0 0 0 4px var(--gray-900);
}

.color-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 0 20px 20px 20px;
}

.color-options-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
  width: 100%;
  max-width: 200px;
}

.color-option-btn {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: white;
  font-weight: bold;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.color-option-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
}

.color-option-btn.selected {
  border-color: var(--gray-900);
  transform: scale(1.05);
  box-shadow: 0 0 0 1px white, 0 0 0 3px var(--gray-900);
}

.color-reset-btn-container {
  min-height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}

.color-reset-btn {
  padding: 4px 12px;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--gray-600);
  background: var(--gray-100);
  border: 1px solid var(--gray-300);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.color-reset-btn:hover {
  background: var(--gray-200);
  color: var(--gray-800);
  border-color: var(--gray-400);
}

.color-reset-btn-placeholder {
  height: 26px;
  width: 1px;
  visibility: hidden;
}

/* Symbol Picker Section */
.symbol-picker-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px;
  background: var(--white);
  border-radius: 8px;
  box-shadow: var(--shadow-md);
  flex: 1;
}

.symbol-picker-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--gray-700);
  white-space: nowrap;
  text-align: center;
}

.symbol-options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(24px, 1fr));
  gap: 4px;
  width: 100%;
  max-width: 200px;
}

/* Symbol Grid in 2x2 layout */
.symbol-options-grid-2x2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  width: 100%;
  justify-items: center;
  align-items: center;
}

.symbol-option-btn {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 2px solid var(--gray-300);
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: var(--gray-700);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.symbol-option-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-color: var(--gray-400);
}

.symbol-option-btn.selected {
  border-color: var(--primary-color);
  background: var(--gray-50);
  transform: scale(1.05);
  box-shadow: 0 0 0 1px white, 0 0 0 3px var(--primary-color);
}

.symbol-clear-btn-container {
  min-height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}

.symbol-clear-btn {
  padding: 4px 12px;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--gray-600);
  background: var(--gray-100);
  border: 1px solid var(--gray-300);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.symbol-clear-btn:hover {
  background: var(--gray-200);
  color: var(--gray-800);
  border-color: var(--gray-400);
}

.symbol-clear-btn-placeholder {
  height: 26px;
  width: 1px;
  visibility: hidden;
}

/* Outer wrapper — this has the scrollbar, border img never touches it */
.preview-scroll-wrapper {
  max-width: 360px;
  width: 100%;
  margin: 0 auto;
  height: calc(100vh - 240px);
  min-height: 440px;
  max-height: 760px;
  overflow-y: scroll;
  overflow-x: hidden;
  border-radius: 0;
  scrollbar-width: thin;
  scrollbar-color: #16A34A #e5e7eb;
}

.preview-scroll-wrapper::-webkit-scrollbar {
  width: 6px;
}

.preview-scroll-wrapper::-webkit-scrollbar-track {
  background: #e5e7eb;
  border-radius: 3px;
}

.preview-scroll-wrapper::-webkit-scrollbar-thumb {
  background: #16A34A;
  border-radius: 3px;
}

.preview-scroll-wrapper::-webkit-scrollbar-thumb:hover {
  background: #166534;
}

.mini-biodata-preview-mini {
  border-radius: 0;
  overflow: hidden !important;
  border: none !important;
  background: var(--white);
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100%;
}

/* Inner scroll — no scrolling, wrapper handles it */
.mini-preview-inner-scroll {
  overflow: visible;
  flex: 1;
  position: relative;
  z-index: 1;
  padding: 22px 22px 30px 22px;
}

/* Elegant border pattern - removed old mehndi pattern */

/* Ornamental border decorations */
.mini-mehndi-border {
  position: relative;
}


/* Decorative line pattern around border - DISABLED to avoid conflict with SVG borders */
/* .mini-mehndi-border::before {
  content: '';
  position: absolute;
  inset: 2px;
  border-radius: 10px;
  background-image:
    linear-gradient(135deg, var(--border-color, #DC2626) 0%, var(--border-color, #DC2626) 30px, transparent 30px),
    linear-gradient(225deg, var(--border-color, #DC2626) 0%, var(--border-color, #DC2626) 30px, transparent 30px),
    linear-gradient(-45deg, var(--border-color, #DC2626) 0%, var(--border-color, #DC2626) 30px, transparent 30px),
    linear-gradient(45deg, var(--border-color, #DC2626) 0%, var(--border-color, #DC2626) 30px, transparent 30px);
  background-size: 40px 40px;
  background-position: top left, top right, bottom left, bottom right;
  background-repeat: no-repeat;
  opacity: 0.15;
  pointer-events: none;
  z-index: 0;
} */

/* Religious symbol as watermark - random placement at 3-4 places */
.mini-symbol-watermark {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  pointer-events: none;
  user-select: none;
  overflow: hidden;
}

.mini-symbol-watermark span {
  position: absolute;
  font-size: 6rem;
  opacity: 0.05;
  pointer-events: none;
}

/* Position 1 - Top Left Area */
.mini-symbol-watermark span:nth-child(1) {
  top: 12%;
  left: 20%;
  transform: rotate(-20deg);
}

/* Position 2 - Top Right Area */
.mini-symbol-watermark span:nth-child(2) {
  top: 25%;
  right: 15%;
  transform: rotate(15deg);
}

/* Position 3 - Middle Left Area */
.mini-symbol-watermark span:nth-child(3) {
  top: 50%;
  left: 15%;
  transform: translateY(-50%) rotate(-10deg);
}

/* Position 4 - Bottom Center Area */
.mini-symbol-watermark span:nth-child(4) {
  bottom: 20%;
  left: 50%;
  transform: translateX(-50%) rotate(20deg);
}

/* Enhanced ornamental border system with COMPLETE SVG FRAMES */

/* SVG border rendered as real img element — pinned over the outer box */
.mini-preview-border-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
  object-fit: fill;
  border-radius: 0;
}


/* Custom border overlay for preview with dynamic color */
.preview-custom-border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: center;
}


/* ========================================
   PHOTO CROPPER MODAL
   ======================================== */

.crop-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.crop-modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.crop-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--gray-200);
}

.crop-modal-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0;
}

.crop-close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--gray-500);
  cursor: pointer;
  padding: 4px 8px;
  line-height: 1;
  transition: color 0.2s;
}

.crop-close-btn:hover {
  color: var(--gray-900);
}

.crop-container {
  position: relative;
  width: 100%;
  height: 400px;
  background: var(--gray-100);
}

.crop-controls {
  padding: 16px 24px;
  border-top: 1px solid var(--gray-200);
  border-bottom: 1px solid var(--gray-200);
}

.zoom-label {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-700);
}

.zoom-slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
  background: var(--gray-300);
}

.zoom-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--primary-red);
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.zoom-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--primary-red);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.crop-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
}

.crop-modal-footer .btn {
  padding: 10px 24px;
  font-size: 0.875rem;
  font-weight: 600;
}

/* ========================================
   COMPLETE ORNATE BORDER FRAMES FOR EACH TEMPLATE
   ======================================== */

/* Template 1: Classic Black & White - Straight double border */
/* Classic templates 1-5: gallery + live preview both use var(--border-image) from the base rules + generateBorderSVG (no hardcoded overrides needed) */

/* Template 1: Corner decorations with proper rotations */
.corner-decoration {
  position: absolute;
  width: 60px;
  height: 60px;
  pointer-events: none;
  z-index: 2;
  background-image: url('../assets/corner1.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

/* Top-left corner - 90deg */
.corner-top-left {
  top: 5px;
  left: 5px;
  transform: rotate(90deg) !important;
}

/* Top-right corner - 90deg */
.corner-top-right {
  top: 5px;
  right: 5px;
  transform: rotate(90deg) !important;
}

/* Bottom-left corner - 180deg counter-clockwise */
.corner-bottom-left {
  bottom: 5px;
  left: 5px;
  transform: rotate(-180deg) !important;
}

/* Bottom-right corner - 90deg */
.corner-bottom-right {
  bottom: 5px;
  right: 5px;
  transform: rotate(90deg) !important;
}

/* Template 2: Modern Green - Floral/Nature ornate corners */
.corner-decoration-nature {
  position: absolute;
  width: 80px;
  height: 80px;
  pointer-events: none;
  z-index: 2;
  background-color: var(--border-color, #16A34A);
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='xMidYMid meet'%3E%3Cdefs%3E%3Cstyle%3E.leaf%7Bfill:black;opacity:0.9;%7D.vine%7Bfill:none;stroke:black;stroke-width:1.5;stroke-linecap:round;%7D%3C/style%3E%3C/defs%3E%3Cg%3E%3Cpath class='vine' d='M5,95 Q20,70 35,55 Q45,45 55,35 Q70,20 95,5'/%3E%3Cpath class='leaf' d='M8,92 Q5,85 8,78 Q15,75 20,78 Q25,82 25,88 Q22,95 15,98 Q10,98 8,92 Z'/%3E%3Cpath class='leaf' d='M25,70 Q22,65 25,60 Q30,58 34,60 Q37,64 37,68 Q35,73 30,75 Q27,75 25,70 Z'/%3E%3Cpath class='leaf' d='M45,48 Q43,45 45,42 Q48,40 51,42 Q53,45 53,48 Q52,51 49,53 Q47,53 45,48 Z'/%3E%3Cpath class='leaf' d='M60,32 Q59,30 60,28 Q62,27 63,28 Q64,30 64,32 Q63,33 62,34 Q61,34 60,32 Z'/%3E%3Cpath class='leaf' d='M75,18 Q74,17 75,15 Q76,14 78,15 Q79,17 79,18 Q78,19 77,20 Q76,20 75,18 Z'/%3E%3Ccircle cx='15' cy='82' r='2' fill='black' opacity='0.6'/%3E%3Ccircle cx='32' cy='62' r='1.5' fill='black' opacity='0.6'/%3E%3Ccircle cx='50' cy='40' r='1.5' fill='black' opacity='0.6'/%3E%3Ccircle cx='68' cy='24' r='1' fill='black' opacity='0.6'/%3E%3C/g%3E%3C/svg%3E");
          mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='xMidYMid meet'%3E%3Cdefs%3E%3Cstyle%3E.leaf%7Bfill:black;opacity:0.9;%7D.vine%7Bfill:none;stroke:black;stroke-width:1.5;stroke-linecap:round;%7D%3C/style%3E%3C/defs%3E%3Cg%3E%3Cpath class='vine' d='M5,95 Q20,70 35,55 Q45,45 55,35 Q70,20 95,5'/%3E%3Cpath class='leaf' d='M8,92 Q5,85 8,78 Q15,75 20,78 Q25,82 25,88 Q22,95 15,98 Q10,98 8,92 Z'/%3E%3Cpath class='leaf' d='M25,70 Q22,65 25,60 Q30,58 34,60 Q37,64 37,68 Q35,73 30,75 Q27,75 25,70 Z'/%3E%3Cpath class='leaf' d='M45,48 Q43,45 45,42 Q48,40 51,42 Q53,45 53,48 Q52,51 49,53 Q47,53 45,48 Z'/%3E%3Cpath class='leaf' d='M60,32 Q59,30 60,28 Q62,27 63,28 Q64,30 64,32 Q63,33 62,34 Q61,34 60,32 Z'/%3E%3Cpath class='leaf' d='M75,18 Q74,17 75,15 Q76,14 78,15 Q79,17 79,18 Q78,19 77,20 Q76,20 75,18 Z'/%3E%3Ccircle cx='15' cy='82' r='2' fill='black' opacity='0.6'/%3E%3Ccircle cx='32' cy='62' r='1.5' fill='black' opacity='0.6'/%3E%3Ccircle cx='50' cy='40' r='1.5' fill='black' opacity='0.6'/%3E%3Ccircle cx='68' cy='24' r='1' fill='black' opacity='0.6'/%3E%3C/g%3E%3C/svg%3E");
  -webkit-mask-size: contain;
          mask-size: contain;
  -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
  -webkit-mask-position: center;
          mask-position: center;
  -webkit-mask-mode: alpha;
          mask-mode: alpha;
}

/* Corner positions for nature corners */
.corner-decoration-nature.corner-top-left {
  top: 8px;
  left: 8px;
  transform: rotate(0deg);
}

.corner-decoration-nature.corner-top-right {
  top: 8px;
  right: 8px;
  transform: rotate(90deg);
}

.corner-decoration-nature.corner-bottom-left {
  bottom: 8px;
  left: 8px;
  transform: rotate(-90deg);
}

.corner-decoration-nature.corner-bottom-right {
  bottom: 8px;
  right: 8px;
  transform: rotate(180deg);
}

/* Classic templates 3-5: gallery uses var(--border-image) from the base rule + generateBorderSVG (no hardcoded overrides) */

/* Elegant templates 6-11: no hardcoded gallery overrides — they use var(--border-image) + generateBorderSVG (the per-template patterns) */

/* Template 16 (amber-classic / Burgundy Filigree): now formatted as Royal dark — gallery uses var(--border-image) via base rule + generateBorderSVG (gold filigree from updated svgPatterns) */

/* Template 17 (royal-mandala / Pearl Strand): now formatted as Royal dark — gallery uses var(--border-image) via base rule + generateBorderSVG (gold pearl strands from updated svgPatterns) */

/* ── Dark Royal Templates — backgrounds ── */
.border-template-sapphire-classic.mini-biodata-preview-mini {
  background-color: #16243D !important;
  background-image: linear-gradient(155deg, #1E3252 0%, #101B2E 100%) !important;
}
.border-template-crimson-rose.mini-biodata-preview-mini {
  background-color: #3A0B1E !important;
  background-image: linear-gradient(155deg, #5B1230 0%, #270714 100%) !important;
}
.border-template-peacock-green.mini-biodata-preview-mini {
  background-color: #0A2E2A !important;
  background-image: linear-gradient(155deg, #0E423B 0%, #05201D 100%) !important;
}
.border-template-amber-classic.mini-biodata-preview-mini {
  background-color: #29132B !important;
  background-image: linear-gradient(155deg, #3D1A40 0%, #1A0A1C 100%) !important;
}
.border-template-royal-mandala.mini-biodata-preview-mini {
  background-color: #1C1C1C !important;
  background-image: linear-gradient(155deg, #2E2E2E 0%, #0E0E0E 100%) !important;
}

/* ── Dark Royal Templates — gold typography ── */
.border-template-sapphire-classic .mini-preview-field strong,
.border-template-crimson-rose .mini-preview-field strong,
.border-template-peacock-green .mini-preview-field strong,
.border-template-amber-classic .mini-preview-field strong,
.border-template-royal-mandala .mini-preview-field strong {
  color: #E8C77A;
}

.border-template-sapphire-classic .mini-preview-field,
.border-template-crimson-rose .mini-preview-field,
.border-template-peacock-green .mini-preview-field,
.border-template-amber-classic .mini-preview-field,
.border-template-royal-mandala .mini-preview-field {
  color: #EDE3CC;
  margin: 0;
  line-height: 1.4;
}

.border-template-sapphire-classic .mini-preview-name-title,
.border-template-crimson-rose .mini-preview-name-title,
.border-template-peacock-green .mini-preview-name-title,
.border-template-amber-classic .mini-preview-name-title,
.border-template-royal-mandala .mini-preview-name-title {
  color: #FFFFFF;
}

.border-template-sapphire-classic .mini-shree-ganesh-text,
.border-template-crimson-rose .mini-shree-ganesh-text,
.border-template-peacock-green .mini-shree-ganesh-text,
.border-template-amber-classic .mini-shree-ganesh-text,
.border-template-royal-mandala .mini-shree-ganesh-text,
.border-template-sapphire-classic .mini-header-icon-left,
.border-template-sapphire-classic .mini-header-icon-right,
.border-template-crimson-rose .mini-header-icon-left,
.border-template-crimson-rose .mini-header-icon-right,
.border-template-peacock-green .mini-header-icon-left,
.border-template-peacock-green .mini-header-icon-right,
.border-template-amber-classic .mini-header-icon-left,
.border-template-amber-classic .mini-header-icon-right,
.border-template-royal-mandala .mini-header-icon-left,
.border-template-royal-mandala .mini-header-icon-right {
  color: #E8C77A;
  background: transparent;
}

.border-template-sapphire-classic .mini-biodata-header,
.border-template-crimson-rose .mini-biodata-header,
.border-template-peacock-green .mini-biodata-header,
.border-template-amber-classic .mini-biodata-header,
.border-template-royal-mandala .mini-biodata-header {
  color: #FFFFFF;
}

.border-template-sapphire-classic .mini-preview-empty p,
.border-template-crimson-rose .mini-preview-empty p,
.border-template-peacock-green .mini-preview-empty p,
.border-template-amber-classic .mini-preview-empty p,
.border-template-royal-mandala .mini-preview-empty p {
  color: #9DB0C9;
}

/* ── Preview section labels ── */
.preview-section-label {
  font-size: 0.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 6px 6px 3px;
  margin-top: 7px;
  margin-bottom: 1px;
  opacity: 0.9;
  display: flex;
  align-items: center;
  gap: 4px;
}

.preview-section-label::before,
.preview-section-label::after {
  content: '';
  flex: 1;
  height: 0.5px;
  background: currentColor;
  opacity: 0.4;
}

/* Dark royal templates: section label text stays gold */
.border-template-sapphire-classic .preview-section-label,
.border-template-crimson-rose .preview-section-label,
.border-template-peacock-green .preview-section-label,
.border-template-amber-classic .preview-section-label,
.border-template-royal-mandala .preview-section-label {
  color: #E8C77A !important;
}


/* Dark Royal Templates gallery-card text override → shared in ../components/TemplateCard.css */

/* ========================================
   LIGHT ROYAL TEMPLATES (Royal Haldi, Royal Mehendi)
   Light brand-colored backgrounds (haldi yellow, mehendi green) + maroon border + maroon typography.
   Brand palette: yellow / maroon / haldi green.
   ======================================== */


/* ========================================
   DECORATIVE TOP CENTER ELEMENTS BY TEMPLATE
   ======================================== */

/* Template 2: modern-green - No additional header decoration needed (border has built-in top ornament) */
/* (other header/field/name rules now in biodata-preview-shared.css) */

/* Premium - Elegant pattern with larger ornate elements */
.border-template-golden-yellow .mini-preview-name-title::before {
  content: '';
  position: absolute;
  top: -26px;
  left: 50%;
  transform: translateX(-50%);
  width: 220px;
  height: 24px;
  background-image:
    /* Center large diamond */
    radial-gradient(circle at 110px 12px, var(--border-color, #DC2626) 5px, transparent 5px),
    /* Inner ring */
    radial-gradient(circle at 110px 12px, transparent 7px, var(--border-color, #DC2626) 7px, var(--border-color, #DC2626) 8px, transparent 8px),
    /* Side ornaments */
    radial-gradient(circle at 85px 12px, var(--border-color, #DC2626) 3.5px, transparent 3.5px),
    radial-gradient(circle at 135px 12px, var(--border-color, #DC2626) 3.5px, transparent 3.5px),
    /* Outer circles */
    radial-gradient(circle at 68px 12px, var(--border-color, #DC2626) 2.5px, transparent 2.5px),
    radial-gradient(circle at 152px 12px, var(--border-color, #DC2626) 2.5px, transparent 2.5px),
    /* Decorative lines */
    linear-gradient(90deg, transparent 0%, transparent 62px, var(--border-color, #DC2626) 62px, var(--border-color, #DC2626) 64px, transparent 64px, transparent 156px, var(--border-color, #DC2626) 156px, var(--border-color, #DC2626) 158px, transparent 158px);
  background-size: 100% 100%;
  background-repeat: no-repeat;
  opacity: 0.8;
  pointer-events: none;
  z-index: 10;
}

/* Festive - Vibrant pattern with multiple small circles */
.border-template-festive-trio .mini-preview-name-title::before {
  content: '';
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  width: 190px;
  height: 20px;
  background-image:
    /* Center cluster */
    radial-gradient(circle at 95px 10px, var(--border-color, #DC2626) 3px, transparent 3px),
    radial-gradient(circle at 88px 10px, var(--border-color, #DC2626) 2px, transparent 2px),
    radial-gradient(circle at 102px 10px, var(--border-color, #DC2626) 2px, transparent 2px),
    radial-gradient(circle at 95px 5px, var(--border-color, #DC2626) 1.5px, transparent 1.5px),
    radial-gradient(circle at 95px 15px, var(--border-color, #DC2626) 1.5px, transparent 1.5px),
    /* Side clusters */
    radial-gradient(circle at 75px 10px, var(--border-color, #DC2626) 2.5px, transparent 2.5px),
    radial-gradient(circle at 115px 10px, var(--border-color, #DC2626) 2.5px, transparent 2.5px),
    radial-gradient(circle at 70px 7px, var(--border-color, #DC2626) 1.5px, transparent 1.5px),
    radial-gradient(circle at 120px 7px, var(--border-color, #DC2626) 1.5px, transparent 1.5px),
    /* Outer dots */
    radial-gradient(circle at 60px 10px, var(--border-color, #DC2626) 2px, transparent 2px),
    radial-gradient(circle at 130px 10px, var(--border-color, #DC2626) 2px, transparent 2px),
    /* Connecting lines */
    linear-gradient(90deg, transparent 0%, transparent 55px, var(--border-color, #DC2626) 55px, var(--border-color, #DC2626) 56px, transparent 56px, transparent 134px, var(--border-color, #DC2626) 134px, var(--border-color, #DC2626) 135px, transparent 135px);
  background-size: 100% 100%;
  background-repeat: no-repeat;
  opacity: 0.8;
  pointer-events: none;
  z-index: 10;
}

/* Luxury - Sophisticated pattern with star-like elements */
.border-template-luxury-gold .mini-preview-name-title::before {
  content: '';
  position: absolute;
  top: -26px;
  left: 50%;
  transform: translateX(-50%);
  width: 230px;
  height: 24px;
  background-image:
    /* Center star pattern */
    radial-gradient(circle at 115px 12px, var(--border-color, #DC2626) 4px, transparent 4px),
    radial-gradient(circle at 115px 6px, var(--border-color, #DC2626) 1.5px, transparent 1.5px),
    radial-gradient(circle at 115px 18px, var(--border-color, #DC2626) 1.5px, transparent 1.5px),
    radial-gradient(circle at 109px 12px, var(--border-color, #DC2626) 1.5px, transparent 1.5px),
    radial-gradient(circle at 121px 12px, var(--border-color, #DC2626) 1.5px, transparent 1.5px),
    /* Side ornaments */
    radial-gradient(circle at 90px 12px, var(--border-color, #DC2626) 3px, transparent 3px),
    radial-gradient(circle at 140px 12px, var(--border-color, #DC2626) 3px, transparent 3px),
    radial-gradient(circle at 85px 8px, var(--border-color, #DC2626) 1.5px, transparent 1.5px),
    radial-gradient(circle at 145px 8px, var(--border-color, #DC2626) 1.5px, transparent 1.5px),
    /* Outer elements */
    radial-gradient(circle at 70px 12px, var(--border-color, #DC2626) 2.5px, transparent 2.5px),
    radial-gradient(circle at 160px 12px, var(--border-color, #DC2626) 2.5px, transparent 2.5px),
    /* Decorative lines with breaks */
    linear-gradient(90deg, transparent 0%, transparent 64px, var(--border-color, #DC2626) 64px, var(--border-color, #DC2626) 66px, transparent 66px, transparent 164px, var(--border-color, #DC2626) 164px, var(--border-color, #DC2626) 166px, transparent 166px);
  background-size: 100% 100%;
  background-repeat: no-repeat;
  opacity: 0.85;
  pointer-events: none;
  z-index: 10;
}

/* Template 3: golden-yellow - Ornate triangles with dots */
.border-template-golden-yellow .mini-preview-name-title::before {
  content: '';
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  width: 210px;
  height: 22px;
  background-image:
    radial-gradient(circle at 105px 11px, var(--border-color, #DC2626) 5px, transparent 5px),
    radial-gradient(circle at 90px 11px, var(--border-color, #DC2626) 3px, transparent 3px),
    radial-gradient(circle at 120px 11px, var(--border-color, #DC2626) 3px, transparent 3px),
    radial-gradient(circle at 75px 11px, var(--border-color, #DC2626) 2px, transparent 2px),
    radial-gradient(circle at 135px 11px, var(--border-color, #DC2626) 2px, transparent 2px),
    radial-gradient(circle at 62px 11px, var(--border-color, #DC2626) 1.5px, transparent 1.5px),
    radial-gradient(circle at 148px 11px, var(--border-color, #DC2626) 1.5px, transparent 1.5px),
    linear-gradient(90deg, transparent 57px, var(--border-color, #DC2626) 57px, var(--border-color, #DC2626) 59px, transparent 59px, transparent 151px, var(--border-color, #DC2626) 151px, var(--border-color, #DC2626) 153px, transparent 153px);
  background-size: 100% 100%;
  background-repeat: no-repeat;
  opacity: 0.75;
  pointer-events: none;
  z-index: 10;
}

/* Template 4-15: Add remaining unique variations */
.border-template-festive-trio .mini-preview-name-title::before,
.border-template-royal-red .mini-preview-name-title::before,
.border-template-nature-green .mini-preview-name-title::before,
.border-template-luxury-gold .mini-preview-name-title::before,
.border-template-maroon-elegance .mini-preview-name-title::before,
.border-template-pink-blossom .mini-preview-name-title::before,
.border-template-emerald-classic .mini-preview-name-title::before,
.border-template-royal-blue .mini-preview-name-title::before,
.border-template-crimson-rose .mini-preview-name-title::before,
.border-template-peacock-green .mini-preview-name-title::before {
  content: '';
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 20px;
  opacity: 0.7;
  pointer-events: none;
  z-index: 10;
}

/* Each template gets unique pattern - showing variation */
.border-template-festive-trio .mini-preview-name-title::before {
  background-image:
    radial-gradient(circle at 100px 10px, var(--border-color, #DC2626) 4px, transparent 4px),
    radial-gradient(circle at 85px 10px, var(--border-color, #DC2626) 3px, transparent 3px),
    radial-gradient(circle at 115px 10px, var(--border-color, #DC2626) 3px, transparent 3px),
    radial-gradient(circle at 70px 10px, var(--border-color, #DC2626) 2.5px, transparent 2.5px),
    radial-gradient(circle at 130px 10px, var(--border-color, #DC2626) 2.5px, transparent 2.5px),
    linear-gradient(90deg, transparent 65px, var(--border-color, #DC2626) 65px, var(--border-color, #DC2626) 67px, transparent 67px, transparent 133px, var(--border-color, #DC2626) 133px, var(--border-color, #DC2626) 135px, transparent 135px);
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.border-template-royal-red .mini-preview-name-title::before {
  background-image:
    radial-gradient(circle at 100px 10px, var(--border-color, #DC2626) 5px, transparent 5px),
    radial-gradient(circle at 82px 10px, var(--border-color, #DC2626) 3px, transparent 3px),
    radial-gradient(circle at 118px 10px, var(--border-color, #DC2626) 3px, transparent 3px),
    radial-gradient(circle at 100px 10px, transparent 7px, var(--border-color, #DC2626) 7px, var(--border-color, #DC2626) 9px, transparent 9px),
    linear-gradient(90deg, transparent 77px, var(--border-color, #DC2626) 77px, var(--border-color, #DC2626) 79px, transparent 79px, transparent 121px, var(--border-color, #DC2626) 121px, var(--border-color, #DC2626) 123px, transparent 123px);
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.border-template-nature-green .mini-preview-name-title::before {
  background-image:
    radial-gradient(ellipse 10px 4px at 100px 10px, var(--border-color, #DC2626) 100%, transparent 100%),
    radial-gradient(circle at 85px 10px, var(--border-color, #DC2626) 2.5px, transparent 2.5px),
    radial-gradient(circle at 115px 10px, var(--border-color, #DC2626) 2.5px, transparent 2.5px),
    radial-gradient(circle at 73px 10px, var(--border-color, #DC2626) 2px, transparent 2px),
    radial-gradient(circle at 127px 10px, var(--border-color, #DC2626) 2px, transparent 2px),
    linear-gradient(90deg, transparent 68px, var(--border-color, #DC2626) 68px, var(--border-color, #DC2626) 69px, transparent 69px, transparent 131px, var(--border-color, #DC2626) 131px, var(--border-color, #DC2626) 132px, transparent 132px);
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.border-template-luxury-gold .mini-preview-name-title::before {
  width: 230px;
  height: 24px;
  top: -26px;
  background-image:
    radial-gradient(circle at 115px 12px, var(--border-color, #DC2626) 5px, transparent 5px),
    radial-gradient(circle at 100px 12px, var(--border-color, #DC2626) 3px, transparent 3px),
    radial-gradient(circle at 130px 12px, var(--border-color, #DC2626) 3px, transparent 3px),
    radial-gradient(circle at 85px 12px, var(--border-color, #DC2626) 2px, transparent 2px),
    radial-gradient(circle at 145px 12px, var(--border-color, #DC2626) 2px, transparent 2px),
    linear-gradient(90deg, transparent 80px, var(--border-color, #DC2626) 80px, var(--border-color, #DC2626) 82px, transparent 82px, transparent 148px, var(--border-color, #DC2626) 148px, var(--border-color, #DC2626) 150px, transparent 150px);
  background-size: 100% 100%;
  background-repeat: no-repeat;
  opacity: 0.85;
}

.border-template-maroon-elegance .mini-preview-name-title::before {
  background-image:
    radial-gradient(circle at 100px 10px, var(--border-color, #DC2626) 3.5px, transparent 3.5px),
    radial-gradient(circle at 88px 10px, var(--border-color, #DC2626) 2.5px, transparent 2.5px),
    radial-gradient(circle at 112px 10px, var(--border-color, #DC2626) 2.5px, transparent 2.5px),
    radial-gradient(circle at 76px 10px, var(--border-color, #DC2626) 2px, transparent 2px),
    radial-gradient(circle at 124px 10px, var(--border-color, #DC2626) 2px, transparent 2px),
    radial-gradient(circle at 66px 10px, var(--border-color, #DC2626) 1.5px, transparent 1.5px),
    radial-gradient(circle at 134px 10px, var(--border-color, #DC2626) 1.5px, transparent 1.5px),
    linear-gradient(90deg, transparent 61px, var(--border-color, #DC2626) 61px, var(--border-color, #DC2626) 63px, transparent 63px, transparent 137px, var(--border-color, #DC2626) 137px, var(--border-color, #DC2626) 139px, transparent 139px);
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.border-template-pink-blossom .mini-preview-name-title::before,
.border-template-emerald-classic .mini-preview-name-title::before,
.border-template-royal-blue .mini-preview-name-title::before,
.border-template-crimson-rose .mini-preview-name-title::before,
.border-template-peacock-green .mini-preview-name-title::before {
  background-image:
    radial-gradient(circle at 100px 10px, var(--border-color, #DC2626) 4px, transparent 4px),
    radial-gradient(circle at 80px 10px, var(--border-color, #DC2626) 3px, transparent 3px),
    radial-gradient(circle at 120px 10px, var(--border-color, #DC2626) 3px, transparent 3px),
    radial-gradient(circle at 65px 10px, var(--border-color, #DC2626) 2px, transparent 2px),
    radial-gradient(circle at 135px 10px, var(--border-color, #DC2626) 2px, transparent 2px),
    linear-gradient(90deg, transparent 60px, var(--border-color, #DC2626) 60px, var(--border-color, #DC2626) 62px, transparent 62px, transparent 138px, var(--border-color, #DC2626) 138px, var(--border-color, #DC2626) 140px, transparent 140px);
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.mini-preview-photo-corner {
  position: absolute;
  top: 120px;
  right: 28px;
  width: 80px;
  height: 80px;
  border-radius: 6px;
  border: 2px solid currentColor;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  z-index: 0;
  background: white;
  box-sizing: content-box;
}

.mini-preview-photo-corner.photo-shape-circle {
  border-radius: 50%;
}


.mini-preview-photo-corner img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
}

/* ── Name title ── */
.mini-preview-name-title {
  font-size: 0.75rem;
  font-weight: 700;
  margin: 0 0 2px 0;
  padding: 4px 12px 2px;
  text-align: center;
  position: relative;
}

.mini-preview-name-title::before {
  display: none !important;
}

/* ── Field rows ── */
.mini-has-photo .mini-preview-field {
  padding-right: 112px;
}

.mini-preview-mini-content {
  padding: 0;
  padding-bottom: 12px;
  flex: 0 0 auto;
  overflow: visible;
  position: relative;
  font-size: 7px;
  line-height: 1.4;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  transform: translateZ(0);
  backface-visibility: hidden;
}

.mini-preview-field {
  padding: 2px 4px;
  border-bottom: none;
  font-size: 7px;
  line-height: 1.4;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transform: translateZ(0);
}

.mini-preview-field:last-child {
  border-bottom: none;
}

.mini-preview-field strong {
  color: var(--gray-700);
  font-weight: 600;
  display: inline-block;
  min-width: 100px;
  font-size: 7px;
}

.mini-preview-empty {
  text-align: center;
  padding: 48px 24px;
  color: var(--gray-400);
}

/* ── Header elements ── */
.mini-ganesha-icon-header {
  position: absolute;
  top: 15px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.5rem;
  z-index: 10;
  display: none;
}

.mini-shree-ganesh-header {
  text-align: center;
  padding: 2px 16px 1px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.mini-shree-ganesh-text {
  font-size: 0.65rem;
  font-weight: 500;
  color: #333333;
  letter-spacing: 1px;
  font-family: serif;
}

.mini-biodata-header {
  text-align: center;
  font-size: 0.62rem;
  font-weight: 600;
  color: #000000;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-family: sans-serif;
  padding: 0 16px 4px;
}

.mini-icon-only-header {
  text-align: center;
  padding: 4px 16px 2px;
}

.mini-icon-center {
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.mini-icon-center svg {
  width: 100%;
  height: 100%;
  display: block;
}

.header-icons-container {
  position: relative;
  height: 0;
  pointer-events: none;
}

.mini-header-icon-left {
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  z-index: 11;
  vertical-align: middle;
}

.mini-header-icon-left svg {
  width: 100%;
  height: 100%;
  display: block;
}

.mini-header-icon-right {
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  z-index: 11;
  vertical-align: middle;
}

.mini-header-icon-right svg {
  width: 100%;
  height: 100%;
  display: block;
}

/* ── Template 1 (elegant-red) ── */
.border-template-elegant-red .mini-preview-name-title::before,
.border-template-elegant-red.mini-hide-shree-ganesh .mini-preview-name-title::before {
  display: none !important;
}

.border-template-elegant-red .mini-preview-name-title::after,
.border-template-elegant-red.mini-hide-biodata .mini-preview-name-title::after {
  display: none !important;
}

.border-template-elegant-red .mini-preview-name-title {
  font-weight: 700;
  color: #000000;
  margin: 0 0 4px 0;
  padding: 8px 12px 4px;
  letter-spacing: 0.5px;
}

/* ── Template 2 (modern-green) ── */
.border-template-modern-green .mini-preview-name-title::before {
  display: none;
}

.preview-mini-footer {
  padding: 16px 24px;
  background: var(--gray-50);
  border-top: 1px solid var(--gray-200);
}

.preview-template-name {
  font-size: 0.875rem;
  color: var(--gray-600);
  margin: 0;
  text-align: center;
}

.preview-template-name strong {
  color: var(--gray-900);
}

/* scrollbar rules now in biodata-preview-shared.css */

/* Responsive Design */
@media (max-width: 1200px) {
  .create-container {
    grid-template-columns: 1fr 350px;
    gap: 24px;
  }
}

@media (max-width: 968px) {
  .create-container {
    grid-template-columns: 1fr;
  }

  .preview-section {
    order: -1;
  }

  .preview-sticky {
    position: static;
    width: 100%;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .religion-grid-compact {
    grid-template-columns: repeat(2, 1fr);
  }

  .template-preview-box {
    height: 220px;
  }

  .preview-icon {
    font-size: 3rem;
  }

  .form-title {
    font-size: 2rem;
  }

  .mini-preview-mini-content {
    max-height: 400px;
  }
}

@media (max-width: 640px) {
  .create-biodata-new-page {
    padding: 20px 12px;
  }

  .form-section-card {
    padding: 20px;
  }

  .religion-grid-compact,
  .template-grid-large {
    grid-template-columns: 1fr;
  }

  .template-preview-box {
    height: 160px;
  }

  .preview-icon {
    font-size: 2.5rem;
  }

  .preview-text {
    font-size: 1rem;
  }

  .template-card-name {
    font-size: 1rem;
  }

  .template-card-price {
    font-size: 1.25rem;
  }

  .section-heading {
    font-size: 1.25rem;
  }
}

```

## `frontend/src/pages/LegalPage.css`
```css
.legal-page {
  background: var(--white);
  padding: 56px 0 120px;
  min-height: 60vh;
}

.legal-doc {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 0 24px;
}

.legal-header {
  margin-bottom: 40px;
  padding-bottom: 24px;
  border-bottom: 2px solid var(--gray-900);
}

.legal-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 12px;
  color: var(--gray-900);
  letter-spacing: -0.02em;
}

.legal-updated {
  color: var(--gray-400);
  font-size: 0.875rem;
  margin-bottom: 24px;
}

.legal-intro {
  color: var(--gray-600);
  font-size: 1.1rem;
  line-height: 1.7;
  margin: 0;
}

.legal-section {
  padding: 32px 0;
  border-top: 1px solid var(--gray-200);
}

.legal-header + .legal-section {
  border-top: none;
  padding-top: 0;
}

.legal-section h2 {
  font-size: 1.35rem;
  font-weight: 800;
  margin-bottom: 16px;
  color: var(--gray-900);
}

.legal-section p {
  color: var(--gray-600);
  margin-bottom: 12px;
  line-height: 1.75;
}

.legal-section p:last-child {
  margin-bottom: 0;
}

.legal-bullets {
  list-style: none;
  padding: 0;
  margin: 16px 0 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legal-bullets li {
  position: relative;
  padding-left: 20px;
  color: var(--gray-600);
  line-height: 1.6;
}

.legal-bullets li::before {
  content: '';
  position: absolute;
  left: 2px;
  top: 8px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--gray-400);
}

@media (max-width: 640px) {
  .legal-page {
    padding: 48px 20px 80px;
  }

  .legal-title {
    font-size: 1.75rem;
  }
}

```

## `frontend/src/pages/biodata-preview-shared.css`
```css
/* ========================================
   SHARED BIODATA PREVIEW STYLES
   Imported by both CreateBiodataNew.tsx and Preview.tsx.
   Do NOT duplicate any of these rules in those files.
   ======================================== */

/* ── Inner scroll container ── */
.preview-inner-scroll {
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
  position: relative;
  z-index: 1;
  scrollbar-width: none;
}

.preview-inner-scroll::-webkit-scrollbar {
  width: 0;
  background: transparent;
}

/* ── Border image element (pinned over scrollable content) ── */
.preview-border-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
  object-fit: fill;
  border-radius: 16px;
}

.biodata-preview-mini::before {
  display: none;
}

.mehndi-border {
  position: relative;
}

/* ── Symbol watermark ── */
.symbol-watermark {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  pointer-events: none;
  user-select: none;
  overflow: hidden;
}

.symbol-watermark span {
  position: absolute;
  font-size: 6rem;
  opacity: 0.05;
  pointer-events: none;
}

.symbol-watermark span:nth-child(1) {
  top: 12%;
  left: 20%;
  transform: rotate(-20deg);
}

.symbol-watermark span:nth-child(2) {
  top: 25%;
  right: 15%;
  transform: rotate(15deg);
}

.symbol-watermark span:nth-child(3) {
  top: 50%;
  left: 15%;
  transform: translateY(-50%) rotate(-10deg);
}

.symbol-watermark span:nth-child(4) {
  bottom: 20%;
  left: 50%;
  transform: translateX(-50%) rotate(20deg);
}

/* ── Photo corner ── */
.preview-photo-corner {
  position: absolute;
  top: 190px;
  right: 44px;
  width: 128px;
  height: 128px;
  border-radius: 8px;
  border: 3px solid currentColor;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  z-index: 0;
  background: white;
  box-sizing: content-box;
}

.preview-photo-corner.photo-shape-circle {
  border-radius: 50%;
}

.preview-photo-corner img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
}

/* ── Name title ── */
.preview-name-title {
  font-size: 0.8rem;
  font-weight: 700;
  margin: 0 0 6px 0;
  padding: 12px 18px 6px;
  text-align: center;
  position: relative;
}

.preview-name-title::before {
  display: none !important;
}

/* ── Field rows ── */
.has-photo .preview-field {
  padding-right: 180px;
}

.preview-mini-content {
  padding: 0;
  padding-bottom: 18px;
  flex: 0 0 auto;
  overflow: visible;
  position: relative;
  font-size: 11px;
  line-height: 1.4;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  transform: translateZ(0);
  backface-visibility: hidden;
}

.preview-field {
  padding: 3px 6px;
  border-bottom: none;
  font-size: 11px;
  line-height: 1.4;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transform: translateZ(0);
}

.preview-field:last-child {
  border-bottom: none;
}

.preview-field strong {
  color: var(--gray-700);
  font-weight: 600;
  display: inline-block;
  min-width: 155px;
  font-size: 11px;
}

.preview-empty {
  text-align: center;
  padding: 48px 24px;
  color: var(--gray-400);
}

.preview-section-label {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 9px 9px 4px;
  margin-top: 11px;
  margin-bottom: 2px;
  opacity: 0.9;
  display: flex;
  align-items: center;
  gap: 6px;
}

.preview-section-label::before,
.preview-section-label::after {
  content: '';
  flex: 1;
  height: 0.5px;
  background: currentColor;
  opacity: 0.4;
}

/* Dark royal templates: section label text stays gold */
.border-template-sapphire-classic .preview-section-label,
.border-template-crimson-rose .preview-section-label,
.border-template-peacock-green .preview-section-label,
.border-template-amber-classic .preview-section-label,
.border-template-royal-mandala .preview-section-label {
  color: #E8C77A !important;
}

.preview-mini-content::-webkit-scrollbar {
  width: 6px;
}

.preview-mini-content::-webkit-scrollbar-track {
  background: var(--gray-100);
  border-radius: 3px;
}

.preview-mini-content::-webkit-scrollbar-thumb {
  background: var(--gray-400);
  border-radius: 3px;
}

.preview-mini-content::-webkit-scrollbar-thumb:hover {
  background: var(--gray-500);
}

/* ── Header elements ── */
.ganesha-icon-header {
  position: absolute;
  top: 15px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.5rem;
  z-index: 10;
  display: none;
}

.shree-ganesh-header {
  text-align: center;
  padding: 6px 16px 3px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
}

.shree-ganesh-text {
  font-size: 0.72rem;
  font-weight: 500;
  color: #333333;
  letter-spacing: 1px;
  font-family: serif;
}

.biodata-header {
  text-align: center;
  font-size: 0.67rem;
  font-weight: 600;
  color: #000000;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-family: sans-serif;
  padding: 0 16px 6px;
}

.icon-only-header {
  text-align: center;
  padding: 6px 16px 3px;
}

.icon-center {
  width: 29px;
  height: 29px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.icon-center svg {
  width: 100%;
  height: 100%;
  display: block;
}

.header-icons-container {
  position: relative;
  height: 0;
  pointer-events: none;
}

.header-icon-left {
  width: 29px;
  height: 29px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  z-index: 11;
  vertical-align: middle;
}

.header-icon-left svg {
  width: 100%;
  height: 100%;
  display: block;
}

.header-icon-right {
  width: 29px;
  height: 29px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  z-index: 11;
  vertical-align: middle;
}

.header-icon-right svg {
  width: 100%;
  height: 100%;
  display: block;
}

/* ── Template 1 (elegant-red) disable pseudo-elements ── */
.border-template-elegant-red .preview-name-title::before,
.border-template-elegant-red.hide-shree-ganesh .preview-name-title::before {
  display: none !important;
}

.border-template-elegant-red .preview-name-title::after,
.border-template-elegant-red.hide-biodata .preview-name-title::after {
  display: none !important;
}

.border-template-elegant-red .preview-name-title {
  font-weight: 700;
  color: #000000;
  margin: 0 0 4px 0;
  padding: 8px 12px 4px;
  letter-spacing: 0.5px;
}

/* ── Template 2 (modern-green) ── */
.border-template-modern-green .preview-name-title::before {
  display: none;
}

/* ── Dark Royal Templates — backgrounds ── */
.border-template-sapphire-classic.biodata-preview-mini {
  background-color: #16243D !important;
  background-image: linear-gradient(155deg, #1E3252 0%, #101B2E 100%) !important;
}

.border-template-crimson-rose.biodata-preview-mini {
  background-color: #3A0B1E !important;
  background-image: linear-gradient(155deg, #5B1230 0%, #270714 100%) !important;
}

.border-template-peacock-green.biodata-preview-mini {
  background-color: #0A2E2A !important;
  background-image: linear-gradient(155deg, #0E423B 0%, #05201D 100%) !important;
}

.border-template-amber-classic.biodata-preview-mini {
  background-color: #29132B !important;
  background-image: linear-gradient(155deg, #3D1A40 0%, #1A0A1C 100%) !important;
}

.border-template-royal-mandala.biodata-preview-mini {
  background-color: #1C1C1C !important;
  background-image: linear-gradient(155deg, #2E2E2E 0%, #0E0E0E 100%) !important;
}

/* ── Dark Royal Templates — gold typography ── */
.border-template-sapphire-classic .preview-field strong,
.border-template-crimson-rose .preview-field strong,
.border-template-peacock-green .preview-field strong,
.border-template-amber-classic .preview-field strong,
.border-template-royal-mandala .preview-field strong {
  color: #E8C77A;
}

.border-template-sapphire-classic .preview-field,
.border-template-crimson-rose .preview-field,
.border-template-peacock-green .preview-field,
.border-template-amber-classic .preview-field,
.border-template-royal-mandala .preview-field {
  color: #EDE3CC;
}

.border-template-sapphire-classic .preview-name-title,
.border-template-crimson-rose .preview-name-title,
.border-template-peacock-green .preview-name-title,
.border-template-amber-classic .preview-name-title,
.border-template-royal-mandala .preview-name-title {
  color: #FFFFFF;
}

.border-template-sapphire-classic .shree-ganesh-text,
.border-template-crimson-rose .shree-ganesh-text,
.border-template-peacock-green .shree-ganesh-text,
.border-template-amber-classic .shree-ganesh-text,
.border-template-royal-mandala .shree-ganesh-text,
.border-template-sapphire-classic .header-icon-left,
.border-template-sapphire-classic .header-icon-right,
.border-template-crimson-rose .header-icon-left,
.border-template-crimson-rose .header-icon-right,
.border-template-peacock-green .header-icon-left,
.border-template-peacock-green .header-icon-right,
.border-template-amber-classic .header-icon-left,
.border-template-amber-classic .header-icon-right,
.border-template-royal-mandala .header-icon-left,
.border-template-royal-mandala .header-icon-right {
  color: #E8C77A;
  background: transparent;
}

.border-template-sapphire-classic .biodata-header,
.border-template-crimson-rose .biodata-header,
.border-template-peacock-green .biodata-header,
.border-template-amber-classic .biodata-header,
.border-template-royal-mandala .biodata-header {
  color: #FFFFFF;
}

.border-template-sapphire-classic .preview-empty p,
.border-template-crimson-rose .preview-empty p,
.border-template-peacock-green .preview-empty p,
.border-template-amber-classic .preview-empty p,
.border-template-royal-mandala .preview-empty p {
  color: #9DB0C9;
}

```
