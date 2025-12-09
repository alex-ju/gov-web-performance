'use client';

import { useEffect, useState } from 'react';
import {
  Grid,
  Column,
  Loading,
  Breadcrumb,
  BreadcrumbItem,
  Tile,
  Tag,
  Accordion,
  AccordionItem,
  Link,
} from '@carbon/react';
import { CheckmarkFilled, WarningFilled, ErrorFilled, Launch, Code } from '@carbon/icons-react';
import Header from '@/components/Header';
import MetricCard from '@/components/MetricCard';
import { MonthlyReport, CountryReport, AuditIssue } from '@/types';
import { getAuditRecommendation } from '@/utils/auditRecommendations';

export default function CountryAuditClient({ tld }: { tld: string }) {

  const [latestReport, setLatestReport] = useState<MonthlyReport | null>(null);
  const [countryReport, setCountryReport] = useState<CountryReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        // Import functions dynamically to avoid circular dependencies
        const { getLatestMonth, fetchCountryDetail } = await import('@/utils/dataLoader');

        const latestMonth = await getLatestMonth();
        if (!latestMonth) {
          setError('No report data available');
          return;
        }

        // Fetch detailed country data from individual file
        const countryDetail = await fetchCountryDetail(latestMonth, tld);
        if (!countryDetail) {
          setError('Country not found or audit data not available');
        } else {
          setCountryReport(countryDetail);
          // Set a mock report with just the date for display
          setLatestReport({
            month: latestMonth,
            generatedAt: countryDetail.timestamp,
            reports: [countryDetail]
          });
        }
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [tld]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <Loading description="Loading audit data..." withOverlay={false} />
        </div>
      </>
    );
  }

  if (error || !countryReport || !latestReport) {
    return (
      <>
        <Header />
        <div className="page-container">
          <h1>Error loading data</h1>
          <p>{error || 'No data available'}</p>
        </div>
      </>
    );
  }

  const baseUrl = process.env.NODE_ENV === 'production' ? '/gov-web-performance' : '';
  const reportDate = new Date(latestReport.generatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Helper function to get severity icon
  const getSeverityIcon = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return <WarningFilled size={20} style={{ color: 'var(--cds-support-error)' }} />;
      case 'medium':
        return <WarningFilled size={20} style={{ color: 'var(--cds-support-warning)' }} />;
      case 'low':
        return <WarningFilled size={20} style={{ color: 'var(--cds-support-info)' }} />;
    }
  };

  // Helper function to format timing metrics
  const formatTiming = (value: number | null, unit: string = 'ms'): string => {
    if (value === null) return 'N/A';
    if (unit === 'ms') {
      return value > 1000 ? `${(value / 1000).toFixed(2)} s` : `${Math.round(value)} ms`;
    }
    return `${value.toFixed(3)}`;
  };

  // Render audit issues for a category
  const renderAuditSection = (
    categoryName: string,
    audits: AuditIssue[] | undefined,
    score: number
  ) => {
    if (!audits || audits.length === 0) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <CheckmarkFilled size={32} style={{ color: '#24a148', marginBottom: '1rem' }} />
          <p style={{ fontSize: '1.125rem', fontWeight: 600 }}>All {categoryName} audits passed!</p>
          <p style={{ color: 'var(--cds-text-secondary)', marginTop: '0.5rem' }}>
            This category scored {score}/100
          </p>
        </div>
      );
    }

    return (
      <div style={{ marginTop: '1rem' }}>
        <p style={{ marginBottom: '1rem', color: 'var(--cds-text-secondary)' }}>
          {audits.length} issue{audits.length !== 1 ? 's' : ''} found affecting this category
        </p>
        <Accordion>
          {audits.map((audit, index) => (
            <AccordionItem
              key={audit.id}
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
                  {getSeverityIcon(audit.severity)}
                  <span style={{ flex: 1 }}>{audit.title}</span>
                  {audit.displayValue && (
                    <span style={{
                      fontSize: '0.875rem',
                      color: 'var(--cds-text-secondary)',
                      marginLeft: '0.5rem'
                    }}>
                      {audit.displayValue}
                    </span>
                  )}
                </div>
              }
            >
              <div style={{ padding: '1rem' }}>
                {/* Lighthouse Description */}
                <div
                  style={{ marginBottom: '1.5rem', lineHeight: 1.6 }}
                  dangerouslySetInnerHTML={{ __html: audit.description }}
                />

                {audit.numericValue !== null && (
                  <div style={{
                    padding: '0.75rem',
                    backgroundColor: 'var(--cds-layer-01)',
                    borderRadius: '4px',
                    marginBottom: '1.5rem'
                  }}>
                    <strong>Current Impact:</strong> {formatTiming(audit.numericValue, audit.numericUnit || 'ms')}
                    {audit.numericUnit && ` ${audit.numericUnit}`}
                  </div>
                )}

                {/* Get recommendations for this audit */}
                {(() => {
                  const recommendation = getAuditRecommendation(audit.id);
                  return (
                    <>
                      {/* Recommendations Section */}
                      <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        backgroundColor: 'var(--cds-layer-accent)',
                        borderRadius: '4px',
                        borderLeft: '3px solid var(--cds-border-interactive)'
                      }}>
                        <h4 style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          marginBottom: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          💡 How to fix this
                        </h4>
                        <ul style={{
                          marginLeft: '1.25rem',
                          lineHeight: 1.6,
                          color: 'var(--cds-text-primary)'
                        }}>
                          {recommendation.tips.map((tip, i) => (
                            <li key={i} style={{ marginBottom: '0.5rem' }}>{tip}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Code Example */}
                      {recommendation.codeExample && (
                        <div style={{ marginTop: '1.5rem' }}>
                          <h4 style={{
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            marginBottom: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <Code size={16} /> Code Example
                          </h4>
                          <p style={{
                            fontSize: '0.875rem',
                            color: 'var(--cds-text-secondary)',
                            marginBottom: '0.75rem'
                          }}>
                            {recommendation.codeExample.description}
                          </p>
                          {recommendation.codeExample.before && (
                            <>
                              <p style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--cds-text-secondary)' }}>
                                ❌ Before:
                              </p>
                              <pre style={{
                                backgroundColor: 'var(--cds-layer-01)',
                                padding: '1rem',
                                borderRadius: '4px',
                                overflow: 'auto',
                                fontSize: '0.875rem',
                                marginBottom: '1rem',
                                border: '1px solid var(--cds-border-subtle)'
                              }}>
                                <code>{recommendation.codeExample.before}</code>
                              </pre>
                            </>
                          )}
                          <p style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--cds-text-secondary)' }}>
                            ✅ {recommendation.codeExample.before ? 'After:' : 'Solution:'}
                          </p>
                          <pre style={{
                            backgroundColor: 'var(--cds-layer-01)',
                            padding: '1rem',
                            borderRadius: '4px',
                            overflow: 'auto',
                            fontSize: '0.875rem',
                            border: '1px solid var(--cds-border-subtle)'
                          }}>
                            <code>{recommendation.codeExample.after}</code>
                          </pre>
                        </div>
                      )}

                      {/* Resources */}
                      <div style={{
                        display: 'flex',
                        gap: '1rem',
                        marginTop: '1.5rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid var(--cds-border-subtle)',
                        flexWrap: 'wrap'
                      }}>
                        {recommendation.resources.map((resource, i) => (
                          <Link
                            key={i}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            {resource.label} <Launch size={16} />
                          </Link>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    );
  };

  const metrics = countryReport.metrics;
  const hasAuditData = metrics.audits !== undefined;

  return (
    <>
      <Header />
      <main className="page-container">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <Breadcrumb style={{ marginBottom: '2rem' }}>
              <BreadcrumbItem href={`${baseUrl}/`}>Home</BreadcrumbItem>
              <BreadcrumbItem href={`${baseUrl}/rankings`}>Rankings</BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>{countryReport.country}</BreadcrumbItem>
            </Breadcrumb>

            <div style={{ marginBottom: '3rem' }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                {countryReport.country}
              </h1>
              <p style={{ fontSize: '1rem', color: 'var(--cds-text-secondary)', marginBottom: '0.5rem' }}>
                <a target='_blank' rel='noopener noreferrer' href={countryReport.url}>
                  {countryReport.url}
                </a>
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                Last audited: {reportDate}
              </p>
            </div>
          </Column>

          {/* Metric Cards */}
          <Column lg={16} md={8} sm={4}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              Overall scores
            </h2>
          </Column>

          <Column lg={3} md={4} sm={4}>
            <MetricCard
              title="Performance"
              score={metrics.performance}
              description="Page load speed and optimization"
            />
          </Column>

          <Column lg={3} md={4} sm={4}>
            <MetricCard
              title="Accessibility"
              score={metrics.accessibility}
              description="Inclusive design and usability"
            />
          </Column>

          <Column lg={3} md={4} sm={4}>
            <MetricCard
              title="Best Practices"
              score={metrics.bestPractices}
              description="Web development standards"
            />
          </Column>

          <Column lg={3} md={4} sm={4}>
            <MetricCard
              title="SEO"
              score={metrics.seo}
              description="Search engine optimization"
            />
          </Column>

          {/* Performance Timing Metrics */}
          {hasAuditData && metrics.timing && (
            <>
              <Column lg={16} md={8} sm={4}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '3rem', marginBottom: '1.5rem' }}>
                  Performance timing metrics
                </h2>
              </Column>

              <Column lg={3} md={4} sm={4}>
                <Tile>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--cds-text-secondary)' }}>
                      First Contentful Paint
                    </p>
                    <p style={{ fontSize: '1.75rem', fontWeight: 600, marginTop: '0.5rem' }}>
                      {formatTiming(metrics.timing.firstContentfulPaint)}
                    </p>
                  </div>
                </Tile>
              </Column>

              <Column lg={3} md={4} sm={4}>
                <Tile>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--cds-text-secondary)' }}>
                      Largest Contentful Paint
                    </p>
                    <p style={{ fontSize: '1.75rem', fontWeight: 600, marginTop: '0.5rem' }}>
                      {formatTiming(metrics.timing.largestContentfulPaint)}
                    </p>
                  </div>
                </Tile>
              </Column>

              <Column lg={3} md={4} sm={4}>
                <Tile>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--cds-text-secondary)' }}>
                      Total Blocking Time
                    </p>
                    <p style={{ fontSize: '1.75rem', fontWeight: 600, marginTop: '0.5rem' }}>
                      {formatTiming(metrics.timing.totalBlockingTime)}
                    </p>
                  </div>
                </Tile>
              </Column>

              <Column lg={3} md={4} sm={4}>
                <Tile>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--cds-text-secondary)' }}>
                      Speed Index
                    </p>
                    <p style={{ fontSize: '1.75rem', fontWeight: 600, marginTop: '0.5rem' }}>
                      {formatTiming(metrics.timing.speedIndex)}
                    </p>
                  </div>
                </Tile>
              </Column>

              <Column lg={4} md={4} sm={4}>
                <Tile>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--cds-text-secondary)' }}>
                      Cumulative Layout Shift
                    </p>
                    <p style={{ fontSize: '1.75rem', fontWeight: 600, marginTop: '0.5rem' }}>
                      {formatTiming(metrics.timing.cumulativeLayoutShift, '')}
                    </p>
                  </div>
                </Tile>
              </Column>
            </>
          )}

          {/* Detailed audit results */}
          {hasAuditData ? (
            <>
              <Column lg={16} md={8} sm={4}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '3rem', marginBottom: '1.5rem' }}>
                  Detailed audit results
                </h2>
                <p style={{ color: 'var(--cds-text-secondary)', marginBottom: '2rem' }}>
                  Expand each category to see specific issues and recommendations for improvement.
                </p>
              </Column>

              {/* Performance Audits */}
              <Column lg={16} md={8} sm={4}>
                <Tile style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
                    Performance issues
                  </h3>
                  {renderAuditSection('Performance', metrics.audits?.performance, metrics.performance)}
                </Tile>
              </Column>

              {/* Accessibility Audits */}
              <Column lg={16} md={8} sm={4}>
                <Tile style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
                    Accessibility issues
                  </h3>
                  {renderAuditSection('Accessibility', metrics.audits?.accessibility, metrics.accessibility)}
                </Tile>
              </Column>

              {/* Best Practices Audits */}
              <Column lg={16} md={8} sm={4}>
                <Tile style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
                    Best practices issues
                  </h3>
                  {renderAuditSection('Best Practices', metrics.audits?.bestPractices, metrics.bestPractices)}
                </Tile>
              </Column>

              {/* SEO Audits */}
              <Column lg={16} md={8} sm={4}>
                <Tile style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
                    SEO issues
                  </h3>
                  {renderAuditSection('SEO', metrics.audits?.seo, metrics.seo)}
                </Tile>
              </Column>
            </>
          ) : (
            <Column lg={16} md={8} sm={4}>
              <Tile style={{ padding: '3rem', textAlign: 'center', marginTop: '2rem' }}>
                <WarningFilled size={32} style={{ color: '#f1c21b', marginBottom: '1rem' }} />
                <p style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                  Detailed audit data not available
                </p>
                <p style={{ color: 'var(--cds-text-secondary)', marginTop: '0.5rem' }}>
                  This report was generated before detailed audit tracking was enabled.
                  New audits will include detailed recommendations.
                </p>
              </Tile>
            </Column>
          )}
        </Grid>
      </main>
    </>
  );
}
