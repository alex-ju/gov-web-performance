const lighthouse = require('lighthouse').default;
const chromeLauncher = require('chrome-launcher');

const url = process.argv[2];

if (!url) {
  console.log('Usage: node scripts/debug-lighthouse.js <url>');
  process.exit(1);
}

async function run() {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--ignore-certificate-errors', '--no-sandbox']
  });
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
    maxWaitForLoad: 45000,
  };

  console.log(`Testing ${url}...`);
  try {
    const runnerResult = await lighthouse(url, options);
    const categories = runnerResult.lhr.categories;
    const metrics = {
      performance: Math.round(categories.performance.score * 100),
      accessibility: Math.round(categories.accessibility.score * 100),
      bestPractices: Math.round(categories['best-practices'].score * 100),
      seo: Math.round(categories.seo.score * 100),
    };

    console.log(`✓ Success: ${url}`);
    console.log('Metrics:', metrics);
  } catch (error) {
    console.error(`✗ Failed: ${url}`);
    console.error(error);
  }

  await chrome.kill();
}

run();
