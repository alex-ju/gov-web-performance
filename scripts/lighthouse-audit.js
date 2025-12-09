const fs = require('fs');
const path = require('path');
const lighthouse = require('lighthouse').default;
const chromeLauncher = require('chrome-launcher');

// Read countries data
const countriesPath = path.join(__dirname, '..', 'public', 'data', 'countries.json');
const countriesData = JSON.parse(fs.readFileSync(countriesPath, 'utf8'));
let countries = countriesData.countries;

// Filter by TLD if argument provided
const targetTld = process.argv[2];
if (targetTld) {
  countries = countries.filter(c => c.tld === targetTld);
  if (countries.length === 0) {
    console.error(`No countries found with TLD: ${targetTld}`);
    process.exit(1);
  }
  console.log(`Filtering for TLD: ${targetTld}`);
}

// Configuration
const REPORTS_DIR = path.join(__dirname, '..', 'public', 'data', 'reports');
const MANIFEST_PATH = path.join(REPORTS_DIR, 'manifest.json');

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

// Lighthouse options
const lighthouseOptions = {
  logLevel: 'info',
  output: 'json',
  onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  formFactor: 'desktop',
  screenEmulation: {
    mobile: false,
    width: 1350,
    height: 940,
    deviceScaleFactor: 1,
    disabled: false,
  },
  throttling: {
    rttMs: 40,
    throughputKbps: 10240,
    cpuSlowdownMultiplier: 1,
  },
};

async function runLighthouse(url) {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--ignore-certificate-errors', '--no-sandbox']
  });
  const options = {
    ...lighthouseOptions,
    port: chrome.port,
    maxWaitForLoad: 45000,
  };

  try {
    const runnerResult = await lighthouse(url, options);
    await chrome.kill();
    return runnerResult;
  } catch (error) {
    await chrome.kill();
    throw error;
  }
}

function extractMetrics(lhr) {
  const categories = lhr.categories;
  const audits = lhr.audits;

  // Extract failed/warning audits for each category
  const extractAuditsForCategory = (categoryId) => {
    const category = categories[categoryId];
    const auditRefs = category.auditRefs || [];
    const failedAudits = [];

    auditRefs.forEach(ref => {
      const audit = audits[ref.id];
      if (!audit) return;

      // Include failed audits (score < 1) or informative audits with warnings
      const score = audit.score !== null ? audit.score : 1;
      if (score < 1 || (audit.scoreDisplayMode === 'informative' && audit.details)) {
        const severity = score === 0 ? 'high' : score < 0.5 ? 'medium' : 'low';

        failedAudits.push({
          id: ref.id,
          title: audit.title,
          description: audit.description,
          score: audit.score,
          scoreDisplayMode: audit.scoreDisplayMode,
          displayValue: audit.displayValue || null,
          severity: severity,
          weight: ref.weight || 0,
          // Extract numeric value for estimated impact
          numericValue: audit.numericValue || null,
          numericUnit: audit.numericUnit || null,
        });
      }
    });

    // Sort by severity (high -> medium -> low) and then by weight
    failedAudits.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return b.weight - a.weight;
    });

    return failedAudits;
  };

  return {
    performance: Math.round(categories.performance.score * 100),
    accessibility: Math.round(categories.accessibility.score * 100),
    bestPractices: Math.round(categories['best-practices'].score * 100),
    seo: Math.round(categories.seo.score * 100),
    audits: {
      performance: extractAuditsForCategory('performance'),
      accessibility: extractAuditsForCategory('accessibility'),
      bestPractices: extractAuditsForCategory('best-practices'),
      seo: extractAuditsForCategory('seo'),
    },
    // Store timing metrics for performance insights
    timing: {
      firstContentfulPaint: audits['first-contentful-paint']?.numericValue || null,
      largestContentfulPaint: audits['largest-contentful-paint']?.numericValue || null,
      totalBlockingTime: audits['total-blocking-time']?.numericValue || null,
      cumulativeLayoutShift: audits['cumulative-layout-shift']?.numericValue || null,
      speedIndex: audits['speed-index']?.numericValue || null,
    }
  };
}

async function auditAllCountries() {
  console.log(`Starting Lighthouse audits for ${countries.length} countries...`);
  const reports = [];
  const timestamp = new Date().toISOString();

  for (let i = 0; i < countries.length; i++) {
    const country = countries[i];
    console.log(`[${i + 1}/${countries.length}] Auditing ${country.name} (${country.url})...`);

    try {
      const result = await runLighthouse(country.url);
      const metrics = extractMetrics(result.lhr);

      reports.push({
        country: country.name,
        tld: country.tld,
        url: country.url,
        timestamp,
        metrics,
      });

      console.log(`  ✓ Performance: ${metrics.performance}, Accessibility: ${metrics.accessibility}`);
    } catch (error) {
      console.error(`  ✗ Failed to audit ${country.name}:`, error.message);
      // Add a report with zero scores for failed audits
      reports.push({
        country: country.name,
        tld: country.tld,
        url: country.url,
        timestamp,
        metrics: {
          performance: 0,
          accessibility: 0,
          bestPractices: 0,
          seo: 0,
        },
      });
    }

    // Add a small delay between requests to be respectful
    if (i < countries.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  return reports;
}

function saveReport(newReports) {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const summaryFilename = `${month}-summary.json`;
  const summaryPath = path.join(REPORTS_DIR, summaryFilename);
  const detailsDir = path.join(REPORTS_DIR, month);

  let allReports = [];
  let generatedAt = now.toISOString();

  // Ensure details directory exists
  if (!fs.existsSync(detailsDir)) {
    fs.mkdirSync(detailsDir, { recursive: true });
  }

  // Read existing summary if it exists
  if (fs.existsSync(summaryPath)) {
    try {
      const existingData = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
      allReports = existingData.reports || [];
    } catch (error) {
      console.warn(`Could not parse existing summary at ${summaryPath}, starting fresh.`);
    }
  }

  // Merge new reports and save individual detail files
  for (const newReport of newReports) {
    const index = allReports.findIndex(r => r.country === newReport.country);

    // Create summary version (without audits and timing)
    const summaryReport = {
      country: newReport.country,
      tld: newReport.tld,
      url: newReport.url,
      timestamp: newReport.timestamp,
      metrics: {
        performance: newReport.metrics.performance,
        accessibility: newReport.metrics.accessibility,
        bestPractices: newReport.metrics.bestPractices,
        seo: newReport.metrics.seo,
      }
    };

    if (index !== -1) {
      allReports[index] = summaryReport;
    } else {
      allReports.push(summaryReport);
    }

    // Save individual detail file with full audit data
    const detailFilename = `${newReport.tld}.json`;
    const detailPath = path.join(detailsDir, detailFilename);
    fs.writeFileSync(detailPath, JSON.stringify(newReport, null, 2));
    console.log(`  Detail file saved: ${month}/${detailFilename}`);
  }

  // Sort by country name
  allReports.sort((a, b) => a.country.localeCompare(b.country));

  const monthlySummary = {
    month,
    generatedAt,
    reports: allReports,
  };

  // Save the monthly summary
  fs.writeFileSync(summaryPath, JSON.stringify(monthlySummary, null, 2));
  console.log(`\nSummary saved to: ${summaryPath}`);
  console.log(`Detail files saved to: ${detailsDir}/`);

  // Update manifest
  updateManifest(month, summaryFilename, generatedAt);

  return summaryPath;
}

function updateManifest(month, filename, generatedAt) {
  let manifest = { reports: [] };

  // Read existing manifest if it exists
  if (fs.existsSync(MANIFEST_PATH)) {
    manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  }

  // Check if this month already exists
  const existingIndex = manifest.reports.findIndex(r => r.month === month);

  if (existingIndex >= 0) {
    // Update existing entry
    manifest.reports[existingIndex] = { month, filename, generatedAt };
  } else {
    // Add new entry
    manifest.reports.push({ month, filename, generatedAt });
  }

  // Sort by month descending (newest first)
  manifest.reports.sort((a, b) => b.month.localeCompare(a.month));

  // Save manifest
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`Manifest updated: ${MANIFEST_PATH}`);
}

// Main execution
async function main() {
  try {
    const reports = await auditAllCountries();
    const reportPath = saveReport(reports);

    console.log('\n✓ Lighthouse audit completed successfully!');
    // We can't easily know the total count in the file without reading it back or returning it from saveReport.
    // But saveReport returns the path.
    // Let's just log the number of *audited* countries here.
    console.log(`  Countries audited in this run: ${reports.length}`);
    console.log(`  Report location: ${reportPath}`);
  } catch (error) {
    console.error('\n✗ Lighthouse audit failed:', error);
    process.exit(1);
  }
}

main();
