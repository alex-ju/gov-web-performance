// Mapping of common Lighthouse audit IDs to specific recommendations and code examples
export interface AuditRecommendation {
  title: string;
  tips: string[];
  codeExample?: {
    language: string;
    before?: string;
    after: string;
    description: string;
  };
  estimatedImpact: string;
  resources: {
    label: string;
    url: string;
  }[];
}

export const auditRecommendations: Record<string, AuditRecommendation> = {
  // Performance
  'render-blocking-resources': {
    title: 'Eliminate render-blocking resources',
    tips: [
      'Use async or defer attributes on script tags',
      'Inline critical CSS and defer non-critical CSS',
      'Remove unused CSS and JavaScript',
      'Consider using resource hints like preload and preconnect',
    ],
    codeExample: {
      language: 'html',
      before: '<script src="app.js"></script>',
      after: '<script src="app.js" defer></script>',
      description: 'Add defer attribute to allow HTML parsing to continue',
    },
    estimatedImpact: 'Can improve page load time by 0.5-2 seconds',
    resources: [
      { label: 'Eliminate render-blocking resources', url: 'https://web.dev/render-blocking-resources/' },
      { label: 'MDN: async and defer', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-defer' },
    ],
  },
  'unused-css-rules': {
    title: 'Remove unused CSS',
    tips: [
      'Use tools like PurgeCSS to remove unused styles',
      'Implement code splitting for CSS',
      'Only load CSS needed for above-the-fold content initially',
      'Use CSS-in-JS solutions with automatic dead code elimination',
    ],
    codeExample: {
      language: 'javascript',
      after: `// Using PurgeCSS in your build process
module.exports = {
  content: ['./src/**/*.{html,js}'],
  css: ['./src/**/*.css']
}`,
      description: 'Configure PurgeCSS to remove unused styles',
    },
    estimatedImpact: 'Can reduce CSS bundle size by 30-90%',
    resources: [
      { label: 'Remove unused CSS', url: 'https://web.dev/unused-css-rules/' },
      { label: 'PurgeCSS', url: 'https://purgecss.com/' },
    ],
  },
  'unminified-css': {
    title: 'Minify CSS',
    tips: [
      'Use build tools to automatically minify CSS in production',
      'Remove comments, whitespace, and unused code',
      'Consider using cssnano or similar minification tools',
    ],
    codeExample: {
      language: 'javascript',
      after: `// Add to your webpack config
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  optimization: {
    minimizer: [new CssMinimizerPlugin()],
  },
};`,
      description: 'Configure webpack to minify CSS',
    },
    estimatedImpact: 'Typically reduces CSS file size by 20-40%',
    resources: [
      { label: 'Minify CSS', url: 'https://web.dev/unminified-css/' },
      { label: 'cssnano', url: 'https://cssnano.co/' },
    ],
  },
  'uses-optimized-images': {
    title: 'Serve images in modern formats',
    tips: [
      'Use WebP or AVIF format for better compression',
      'Implement responsive images with srcset',
      'Use lazy loading for below-the-fold images',
      'Compress images without losing quality',
    ],
    codeExample: {
      language: 'html',
      before: '<img src="photo.jpg" alt="Photo">',
      after: `<picture>
  <source srcset="photo.webp" type="image/webp">
  <source srcset="photo.jpg" type="image/jpeg">
  <img src="photo.jpg" alt="Photo" loading="lazy">
</picture>`,
      description: 'Use picture element with WebP fallback',
    },
    estimatedImpact: 'Can reduce image file sizes by 25-35% compared to JPEG',
    resources: [
      { label: 'Use modern image formats', url: 'https://web.dev/uses-webp-images/' },
      { label: 'MDN: Responsive images', url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images' },
    ],
  },

  // Accessibility
  'color-contrast': {
    title: 'Ensure sufficient color contrast',
    tips: [
      'Maintain a minimum contrast ratio of 4.5:1 for normal text',
      'Use 3:1 ratio for large text (18pt+ or 14pt+ bold)',
      'Test your design with contrast checking tools',
      'Avoid using color alone to convey information',
    ],
    codeExample: {
      language: 'css',
      before: 'color: #999; /* on white background */',
      after: 'color: #767676; /* meets WCAG AA standard */',
      description: 'Use darker gray for better contrast',
    },
    estimatedImpact: 'Critical for users with visual impairments (~4% of population)',
    resources: [
      { label: 'Color contrast', url: 'https://web.dev/color-contrast/' },
      { label: 'WCAG contrast guidelines', url: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html' },
    ],
  },
  'image-alt': {
    title: 'Add alt text to images',
    tips: [
      'Provide descriptive alt text for all informative images',
      'Use empty alt="" for decorative images',
      'Keep alt text concise but meaningful',
      'Avoid phrases like "image of" or "picture of"',
    ],
    codeExample: {
      language: 'html',
      before: '<img src="chart.png">',
      after: '<img src="chart.png" alt="Bar chart showing 25% increase in sales for Q4 2024">',
      description: 'Describe the content and purpose of the image',
    },
    estimatedImpact: 'Essential for screen reader users and SEO',
    resources: [
      { label: 'Image alt text', url: 'https://web.dev/image-alt/' },
      { label: 'W3C: Alt text decision tree', url: 'https://www.w3.org/WAI/tutorials/images/decision-tree/' },
    ],
  },
  'aria-required-attr': {
    title: 'ARIA attributes must have valid values',
    tips: [
      'Ensure all ARIA attributes have appropriate values',
      'Use semantic HTML before reaching for ARIA',
      'Follow ARIA authoring practices',
      'Test with screen readers',
    ],
    codeExample: {
      language: 'html',
      before: '<button aria-expanded>Menu</button>',
      after: '<button aria-expanded="false" aria-controls="menu-items">Menu</button>',
      description: 'ARIA attributes require explicit values',
    },
    estimatedImpact: 'Critical for assistive technology users',
    resources: [
      { label: 'ARIA required attributes', url: 'https://web.dev/aria-required-attr/' },
      { label: 'ARIA Authoring Practices', url: 'https://www.w3.org/WAI/ARIA/apg/' },
    ],
  },

  // SEO
  'meta-description': {
    title: 'Add a meta description',
    tips: [
      'Write a unique description for each page (150-160 characters)',
      'Include target keywords naturally',
      'Make it compelling to encourage clicks',
      'Accurately summarize the page content',
    ],
    codeExample: {
      language: 'html',
      after: '<meta name="description" content="Government web performance dashboard tracking accessibility, speed, and SEO metrics for 45+ European countries using Google Lighthouse.">',
      description: 'Add meta description in the head section',
    },
    estimatedImpact: 'Improves click-through rates from search results by 5-15%',
    resources: [
      { label: 'Meta descriptions', url: 'https://web.dev/meta-description/' },
      { label: 'Google: Meta descriptions', url: 'https://developers.google.com/search/docs/appearance/snippet' },
    ],
  },
  'document-title': {
    title: 'Document has a title element',
    tips: [
      'Every page should have a unique, descriptive title',
      'Keep titles under 60 characters',
      'Put important keywords first',
      'Include your brand name at the end',
    ],
    codeExample: {
      language: 'html',
      after: '<title>Government Web Performance Dashboard | Country Rankings</title>',
      description: 'Add a descriptive title in the head section',
    },
    estimatedImpact: 'Essential for SEO and user experience',
    resources: [
      { label: 'Document title', url: 'https://web.dev/document-title/' },
      { label: 'MDN: title element', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/title' },
    ],
  },
  'link-text': {
    title: 'Use descriptive link text',
    tips: [
      'Avoid generic phrases like "click here" or "read more"',
      'Make link text self-explanatory',
      'Keep link text concise but meaningful',
      'Ensure links make sense out of context',
    ],
    codeExample: {
      language: 'html',
      before: '<a href="/report">Click here</a> for the full report',
      after: '<a href="/report">View the full accessibility report</a>',
      description: 'Use specific, descriptive link text',
    },
    estimatedImpact: 'Improves both SEO and accessibility',
    resources: [
      { label: 'Link text', url: 'https://web.dev/link-text/' },
      { label: 'WebAIM: Links and Hypertext', url: 'https://webaim.org/techniques/hypertext/' },
    ],
  },

  // Best Practices
  'uses-https': {
    title: 'Use HTTPS',
    tips: [
      'Obtain an SSL/TLS certificate',
      'Redirect all HTTP traffic to HTTPS',
      'Use HSTS headers to enforce HTTPS',
      'Ensure all resources load over HTTPS',
    ],
    codeExample: {
      language: 'nginx',
      after: `# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}`,
      description: 'Configure server to redirect to HTTPS',
    },
    estimatedImpact: 'Essential for security and SEO (Google ranking factor)',
    resources: [
      { label: 'Does not use HTTPS', url: 'https://web.dev/is-on-https/' },
      { label: "Let's Encrypt (Free SSL)", url: 'https://letsencrypt.org/' },
    ],
  },
  'csp-xss': {
    title: 'Implement Content Security Policy',
    tips: [
      'Define a strict CSP header to prevent XSS attacks',
      'Start with a restrictive policy and gradually relax as needed',
      'Use nonces or hashes for inline scripts',
      'Monitor CSP violations',
    ],
    codeExample: {
      language: 'http',
      after: `Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self' 'nonce-{random}'; 
  style-src 'self' 'unsafe-inline';`,
      description: 'Add CSP header to HTTP responses',
    },
    estimatedImpact: 'Significantly reduces XSS attack surface',
    resources: [
      { label: 'Content Security Policy', url: 'https://web.dev/csp/' },
      { label: 'MDN: CSP', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP' },
    ],
  },
};

/**
 * Get recommendation for a specific audit ID
 * Returns a default recommendation if specific one is not available
 */
export function getAuditRecommendation(auditId: string): AuditRecommendation {
  return auditRecommendations[auditId] || {
    title: 'General Recommendation',
    tips: [
      'Review the Lighthouse documentation for specific guidance',
      'Test your changes thoroughly',
      'Consider consulting web.dev for best practices',
      'Use browser DevTools to diagnose issues',
    ],
    estimatedImpact: 'Varies depending on the issue',
    resources: [
      { label: 'Lighthouse documentation', url: `https://web.dev/lighthouse-${auditId}/` },
      { label: 'web.dev', url: 'https://web.dev/' },
    ],
  };
}
