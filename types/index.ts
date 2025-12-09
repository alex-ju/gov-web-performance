// Country information
export interface Country {
  name: string;
  url: string;
  tld: string;
}

// Individual audit failure/warning
export interface AuditIssue {
  id: string;
  title: string;
  description: string;
  score: number | null;
  scoreDisplayMode: string;
  displayValue: string | null;
  severity: 'high' | 'medium' | 'low';
  weight: number;
  numericValue: number | null;
  numericUnit: string | null;
}

// Categorized audit issues
export interface CategorizedAudits {
  performance: AuditIssue[];
  accessibility: AuditIssue[];
  bestPractices: AuditIssue[];
  seo: AuditIssue[];
}

// Performance timing metrics
export interface TimingMetrics {
  firstContentfulPaint: number | null;
  largestContentfulPaint: number | null;
  totalBlockingTime: number | null;
  cumulativeLayoutShift: number | null;
  speedIndex: number | null;
}

// Lighthouse metrics scores (0-100)
export interface LighthouseMetrics {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  audits?: CategorizedAudits;
  timing?: TimingMetrics;
}

// Individual country report
export interface CountryReport {
  country: string;
  tld: string;
  url: string;
  timestamp: string;
  metrics: LighthouseMetrics;
}

// Monthly report containing all countries
export interface MonthlyReport {
  month: string; // YYYY-MM format
  generatedAt: string;
  reports: CountryReport[];
}

// Ranking information
export interface CountryRanking {
  country: string;
  tld: string;
  rank: number;
  score: number;
  previousRank?: number;
  change?: number; // positive = moved up, negative = moved down
}

// Rankings by metric
export interface MetricRankings {
  metric: keyof LighthouseMetrics;
  rankings: CountryRanking[];
}

// Historical data point for charts
export interface HistoricalDataPoint {
  month: string;
  value: number;
}

// Country historical data
export interface CountryHistoricalData {
  country: string;
  tld: string;
  performance: HistoricalDataPoint[];
  accessibility: HistoricalDataPoint[];
  bestPractices: HistoricalDataPoint[];
  seo: HistoricalDataPoint[];
}

// Report manifest for discovery
export interface ReportManifest {
  reports: {
    month: string;
    filename: string;
    generatedAt: string;
  }[];
}
