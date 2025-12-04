import { Country, MonthlyReport, ReportManifest, CountryHistoricalData, MetricRankings, LighthouseMetrics } from '@/types';

const BASE_PATH = process.env.NODE_ENV === 'production' ? '/gov-web-performance' : '';

/**
 * Fetch countries data
 */
export async function fetchCountries(): Promise<Country[]> {
  const response = await fetch(`${BASE_PATH}/data/countries.json`);
  if (!response.ok) {
    throw new Error('Failed to fetch countries data');
  }
  const data = await response.json();
  return data.countries;
}

/**
 * Fetch report manifest
 */
export async function fetchReportManifest(): Promise<ReportManifest> {
  try {
    const response = await fetch(`${BASE_PATH}/data/reports/manifest.json`);
    if (!response.ok) {
      // Return empty manifest if file doesn't exist yet
      return { reports: [] };
    }
    return await response.json();
  } catch (error) {
    console.warn('No manifest found, returning empty:', error);
    return { reports: [] };
  }
}

/**
 * Fetch a specific monthly report
 */
export async function fetchMonthlyReport(month: string): Promise<MonthlyReport | null> {
  try {
    const response = await fetch(`${BASE_PATH}/data/reports/${month}.json`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch report for ${month}:`, error);
    return null;
  }
}

/**
 * Fetch all available reports
 */
export async function fetchAllReports(): Promise<MonthlyReport[]> {
  const manifest = await fetchReportManifest();
  const reports = await Promise.all(
    manifest.reports.map(({ month }) => fetchMonthlyReport(month))
  );
  return reports.filter((report): report is MonthlyReport => report !== null);
}

/**
 * Get the latest report
 */
export async function fetchLatestReport(): Promise<MonthlyReport | null> {
  const manifest = await fetchReportManifest();
  if (manifest.reports.length === 0) {
    return null;
  }

  // Reports should be sorted by month descending in manifest
  const latestMonth = manifest.reports[0].month;
  return fetchMonthlyReport(latestMonth);
}

/**
 * Calculate rankings for a specific metric
 */
export function calculateRankings(
  currentReport: MonthlyReport,
  previousReport: MonthlyReport | null,
  metric: keyof LighthouseMetrics
): MetricRankings {
  // Sort countries by metric score (descending)
  const sorted = [...currentReport.reports].sort(
    (a, b) => b.metrics[metric] - a.metrics[metric]
  );

  // Create rankings with change indicators
  const rankings = sorted.map((report, index) => {
    const rank = index + 1;
    let previousRank: number | undefined;
    let change: number | undefined;

    if (previousReport) {
      const prevReport = previousReport.reports.find(r => r.tld === report.tld);
      if (prevReport) {
        const prevSorted = [...previousReport.reports].sort(
          (a, b) => b.metrics[metric] - a.metrics[metric]
        );
        previousRank = prevSorted.findIndex(r => r.tld === report.tld) + 1;
        change = previousRank - rank; // positive = moved up
      }
    }

    return {
      country: report.country,
      tld: report.tld,
      rank,
      score: report.metrics[metric],
      previousRank,
      change,
    };
  });

  return {
    metric,
    rankings,
  };
}

/**
 * Get historical data for a specific country
 */
export function getCountryHistoricalData(
  reports: MonthlyReport[],
  tld: string
): CountryHistoricalData | null {
  const sortedReports = [...reports].sort((a, b) => a.month.localeCompare(b.month));

  const countryReports = sortedReports
    .map(report => report.reports.find(r => r.tld === tld))
    .filter((r): r is NonNullable<typeof r> => r !== undefined);

  if (countryReports.length === 0) {
    return null;
  }

  const firstReport = countryReports[0];

  return {
    country: firstReport.country,
    tld: firstReport.tld,
    performance: countryReports.map((r, i) => ({
      month: sortedReports[i].month,
      value: r.metrics.performance,
    })),
    accessibility: countryReports.map((r, i) => ({
      month: sortedReports[i].month,
      value: r.metrics.accessibility,
    })),
    bestPractices: countryReports.map((r, i) => ({
      month: sortedReports[i].month,
      value: r.metrics.bestPractices,
    })),
    seo: countryReports.map((r, i) => ({
      month: sortedReports[i].month,
      value: r.metrics.seo,
    })),
  };
}

/**
 * Calculate average scores across all countries
 */
export function calculateAverageScores(report: MonthlyReport): LighthouseMetrics {
  const totals = report.reports.reduce(
    (acc, r) => ({
      performance: acc.performance + r.metrics.performance,
      accessibility: acc.accessibility + r.metrics.accessibility,
      bestPractices: acc.bestPractices + r.metrics.bestPractices,
      seo: acc.seo + r.metrics.seo,
    }),
    { performance: 0, accessibility: 0, bestPractices: 0, seo: 0 }
  );

  const count = report.reports.length;

  return {
    performance: Math.round(totals.performance / count),
    accessibility: Math.round(totals.accessibility / count),
    bestPractices: Math.round(totals.bestPractices / count),
    seo: Math.round(totals.seo / count),
  };
}
