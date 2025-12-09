import { Country, MonthlyReport, CountryReport, ReportManifest, CountryHistoricalData, MetricRankings, LighthouseMetrics } from '@/types';

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
 * Fetch a specific monthly summary report (lightweight - no detailed audits)
 */
export async function fetchMonthlySummary(month: string): Promise<MonthlyReport | null> {
  try {
    const response = await fetch(`${BASE_PATH}/data/reports/${month}-summary.json`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch summary for ${month}:`, error);
    return null;
  }
}

/**
 * Fetch detailed country report for a specific month and country
 */
export async function fetchCountryDetail(
  month: string,
  tld: string
): Promise<CountryReport | null> {
  try {
    const response = await fetch(`${BASE_PATH}/data/reports/${month}/${tld}.json`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch detail for ${tld} in ${month}:`, error);
    return null;
  }
}

/**
 * Fetch a specific monthly report (DEPRECATED - use fetchMonthlySummary instead)
 * Kept for backward compatibility
 */
export async function fetchMonthlyReport(month: string): Promise<MonthlyReport | null> {
  // Try summary first (new format)
  let report = await fetchMonthlySummary(month);
  if (report) return report;

  // Fallback to old format for existing data
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
 * Fetch all available summary reports (lightweight)
 */
export async function fetchAllReports(): Promise<MonthlyReport[]> {
  const manifest = await fetchReportManifest();
  const reports = await Promise.all(
    manifest.reports.map(({ month }) => fetchMonthlySummary(month))
  );
  return reports.filter((report): report is MonthlyReport => report !== null);
}

/**
 * Get the latest summary report (lightweight)
 */
export async function fetchLatestReport(): Promise<MonthlyReport | null> {
  const manifest = await fetchReportManifest();
  if (manifest.reports.length === 0) {
    return null;
  }

  // Reports should be sorted by month descending in manifest
  const latestMonth = manifest.reports[0].month;
  return fetchMonthlySummary(latestMonth);
}

/**
 * Get the latest month identifier
 */
export async function getLatestMonth(): Promise<string | null> {
  const manifest = await fetchReportManifest();
  if (manifest.reports.length === 0) {
    return null;
  }
  return manifest.reports[0].month;
}

/**
 * Calculate rankings for a specific metric
 */
export function calculateRankings(
  currentReport: MonthlyReport,
  previousReport: MonthlyReport | null,
  metric: 'performance' | 'accessibility' | 'bestPractices' | 'seo'
): MetricRankings {
  // Sort countries by metric score (descending)
  const sorted = [...currentReport.reports].sort(
    (a, b) => {
      const scoreA = a.metrics[metric];
      const scoreB = b.metrics[metric];
      // Ensure we're comparing numbers
      if (typeof scoreA === 'number' && typeof scoreB === 'number') {
        return scoreB - scoreA;
      }
      return 0;
    }
  );

  // Create rankings with change indicators
  const rankings = sorted.map((report, index) => {
    const rank = index + 1;
    const score = report.metrics[metric];
    let previousRank: number | undefined;
    let change: number | undefined;

    if (previousReport) {
      const prevReport = previousReport.reports.find(r => r.tld === report.tld);
      if (prevReport) {
        const prevSorted = [...previousReport.reports].sort(
          (a, b) => {
            const scoreA = a.metrics[metric];
            const scoreB = b.metrics[metric];
            if (typeof scoreA === 'number' && typeof scoreB === 'number') {
              return scoreB - scoreA;
            }
            return 0;
          }
        );
        previousRank = prevSorted.findIndex(r => r.tld === report.tld) + 1;
        change = previousRank - rank; // positive = moved up
      }
    }

    return {
      country: report.country,
      tld: report.tld,
      rank,
      score: typeof score === 'number' ? score : 0,
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
