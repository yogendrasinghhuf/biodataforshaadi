export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface LegalPageContent {
  title: string;
  updated: string;
  intro?: string;
  sections: LegalSection[];
}

export const legalContent: Record<string, LegalPageContent> = {
  terms: {
    title: 'Terms of Service',
    updated: 'August 2026',
    intro:
      'Welcome to BiodataForShaadi. By browsing or using this website, you agree to comply with and be bound by the following terms and conditions of use, which together with our Privacy Policy govern BiodataForShaadi\'s relationship with you.',
    sections: [
      {
        heading: '1. Definitions',
        paragraphs: [
          '"We", "us", and "our" refer to BiodataForShaadi. "You" and "your" refer to any visitor or user of this website, whether browsing for free or making a purchase. "Services" means the biodata creation, template, and download services offered on this website.',
        ],
      },
      {
        heading: '2. User Agreement',
        paragraphs: [
          'These terms apply to all visitors and users of the site, whether or not you make a purchase. You agree to use the Services solely for your own personal or internal purposes, and not for any unlawful purpose.',
          'You must be 18 or older to make a purchase on this website.',
        ],
      },
      {
        heading: '3. Your Content',
        paragraphs: [
          'The details you enter to build your biodata (name, family information, photos, etc.) are processed in your browser and used only to generate your document. You are responsible for the accuracy of the information you provide.',
          'In line with the Information Technology (Intermediary Guidelines) Rules, 2021, you agree not to upload or submit content that is defamatory, obscene, infringes another person\'s rights, impersonates any person, or is intended to mislead or harass for financial or other gain.',
        ],
      },
      {
        heading: '4. Amendment to This Agreement',
        paragraphs: [
          'We may revise these terms at any time, with or without notice, by updating this page. Changes take effect immediately on posting, and your continued use of the website after changes are posted constitutes acceptance of the revised terms.',
        ],
      },
      {
        heading: '5. Payments and Refunds',
        paragraphs: [
          'Templates are offered as a one-time purchase per download, processed securely through Razorpay. Because a biodata is a digital good delivered instantly, no refund is available once it has been generated or downloaded, except in the limited circumstances set out in our Refund Policy.',
        ],
      },
      {
        heading: '6. Disclaimer',
        paragraphs: [
          'The information and templates on this website are provided for general use only. While we try to keep everything accurate and up to date, we make no representations or warranties of any kind about the completeness, accuracy, or suitability of the Services, and you use them at your own risk.',
        ],
      },
      {
        heading: '7. Intellectual Property Rights',
        paragraphs: [
          'Unless otherwise stated, BiodataForShaadi owns the intellectual property rights for all template designs, graphics, and other material on this website. These works are protected under Indian copyright law and international treaty provisions.',
          'You may not do any of the following without our prior written consent:',
        ],
        bullets: [
          'Republish, sell, rent, or sub-license material from this website',
          'Reproduce, duplicate, or copy template designs or site content',
          'Scrape, extract, or systematically download data from this website',
          'Redistribute content from this website, including onto another website',
        ],
      },
      {
        heading: '8. Limitation of Liability',
        paragraphs: [
          'BiodataForShaadi is not liable for any indirect, incidental, or consequential loss arising from your use of the Services, including loss of data, loss of income, or any damages resulting from downtime or technical issues.',
        ],
      },
      {
        heading: '9. Governing Law',
        paragraphs: [
          'These terms are governed by the laws of India, and any disputes relating to them are subject to the exclusive jurisdiction of the courts of India.',
        ],
      },
      {
        heading: '10. Contact Us',
        paragraphs: [
          'If you have any questions about these Terms of Service, or wish to report a violation, please contact us at support@biodataforshaadi.com.',
        ],
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    updated: 'August 2026',
    intro:
      'This Privacy Policy explains what information BiodataForShaadi collects, how it is used, and the choices you have — we aim to collect the minimum necessary to provide the service.',
    sections: [
      {
        heading: '1. Browser-Based Privacy',
        paragraphs: [
          'Your biodata is generated entirely in your browser. Personal details you enter into the form — name, family details, photos, and so on — are not uploaded to or stored on our servers while you are editing.',
        ],
      },
      {
        heading: '2. What We Collect',
        paragraphs: [
          'To process an order, we collect your name and contact details, used solely for payment tracking and transaction verification.',
          'Payment details (card, UPI, netbanking, etc.) are collected and processed directly by Razorpay, our payment partner — we never see or store this information.',
        ],
        bullets: [
          'Name and mobile number / email — for order and payment verification',
          'Payment information — collected and processed by Razorpay directly',
          'Basic technical data (browser type, pages visited) — for analytics',
        ],
      },
      {
        heading: '3. Retention of Biodata Files',
        paragraphs: [
          'A copy of a paid, downloaded biodata may be retained on our servers for a short period, up to 24 hours, solely to help resolve download issues. After this period, it is permanently deleted.',
        ],
      },
      {
        heading: '4. How We Use Your Information',
        paragraphs: [
          'We use your information only to generate your biodata, process payment, and provide customer support. We do not sell your data, use it for marketing, or share it with third parties beyond what is required to process your payment.',
        ],
      },
      {
        heading: '5. Cookies',
        paragraphs: [
          'We use minimal cookies and local storage to remember your in-progress biodata and template choice, plus basic analytics cookies to help improve the site. You can disable cookies at any time in your browser settings.',
        ],
      },
      {
        heading: '6. Your Rights',
        paragraphs: [
          'You may decline to provide requested information, though this may prevent you from completing your order. You can request that we delete any retained copy of your biodata by writing to us.',
        ],
      },
      {
        heading: '7. Contact Us',
        paragraphs: [
          'For privacy questions, or to report a concern or breach, contact support@biodataforshaadi.com.',
        ],
      },
    ],
  },
  refund: {
    title: 'Refund Policy',
    updated: 'August 2026',
    intro:
      'BiodataForShaadi delivers a digital product. Due to the nature of digital goods, all sales are generally final once a biodata has been generated or downloaded — the exceptions below explain when a refund can still be requested.',
    sections: [
      {
        heading: '1. When a Refund Applies',
        paragraphs: ['We will review refund requests for:'],
        bullets: [
          'A verified technical failure that prevented your biodata from being generated',
          'A duplicate payment charge for the same order',
          'Payment deducted but no download delivered, after multiple attempts',
          'The wrong product delivered due to a system error, reported within 24 hours',
        ],
      },
      {
        heading: '2. When a Refund Does Not Apply',
        paragraphs: ['Refunds do not apply to:'],
        bullets: [
          'Biodatas that have already been generated or downloaded',
          'Low-quality photos that you uploaded',
          'Information you entered incorrectly',
          'Change-of-mind requests',
          'Device or browser compatibility issues',
          'Design change requests made after delivery',
        ],
      },
      {
        heading: '3. How to Request a Refund',
        paragraphs: [
          'Email support@biodataforshaadi.com within 24 hours of your purchase, referencing your order ID, with your transaction details and a description of the issue (screenshots help). Requests made after 24 hours will not be considered.',
        ],
      },
      {
        heading: '4. Processing Time',
        paragraphs: [
          'Eligible requests are typically reviewed within 3-5 business days. Once a refund is approved, it takes a further 4-5 business days to reflect in your original payment method.',
        ],
      },
      {
        heading: '5. Alternatives to a Refund',
        paragraphs: [
          'Before requesting a refund, we\'re happy to help with download assistance, technical troubleshooting, or an alternative delivery method — many issues can be resolved without a refund.',
        ],
      },
    ],
  },
  shipping: {
    title: 'Shipping and Delivery Policy',
    updated: 'August 2026',
    intro:
      'BiodataForShaadi is a fully digital service. This policy explains how your biodata is delivered, since no physical shipping is involved.',
    sections: [
      {
        heading: '1. Digital Delivery Only',
        paragraphs: [
          'All marriage biodata templates available for purchase on BiodataForShaadi are digital products, delivered via digital download only. No physical items are shipped, and no shipping address or delivery charges apply.',
        ],
      },
      {
        heading: '2. Delivery Time',
        paragraphs: [
          'There is no waiting period — once your payment is confirmed by Razorpay, your biodata PDF is available for instant download in your browser.',
        ],
      },
      {
        heading: '3. Keeping Your File Safe',
        paragraphs: [
          'Once downloaded, you are responsible for saving and backing up your file, for example to your device or a cloud storage service.',
        ],
      },
      {
        heading: '4. If Your Download Doesn\'t Start',
        paragraphs: [
          'If you don\'t receive your download after a successful payment, contact support@biodataforshaadi.com with your transaction details, and we will help resolve the issue or resend your file.',
        ],
      },
    ],
  },
  contact: {
    title: 'Contact Us',
    updated: 'August 2026',
    intro:
      'Have a question about templates, pricing, or your order? Need help with a download or payment issue? We\'re happy to help.',
    sections: [
      {
        heading: 'Support Email',
        paragraphs: ['support@biodataforshaadi.com'],
      },
      {
        heading: 'Response Time',
        paragraphs: ['We typically respond within 24 hours on business days.'],
      },
      {
        heading: 'Before You Write In',
        paragraphs: [
          'For refund-related queries, please review our Refund Policy first so you know what\'s eligible. For payment or download issues, include your order/payment reference and a screenshot if possible — it helps us resolve things faster.',
        ],
      },
    ],
  },
};
