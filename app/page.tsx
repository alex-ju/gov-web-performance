'use client';

import { useEffect, useState } from 'react';
import { Grid, Column, Loading, UnorderedList, ListItem } from '@carbon/react';
import Header from '@/components/Header';
import MetricCard from '@/components/MetricCard';
import { MonthlyReport } from '@/types';
import { fetchLatestReport, calculateAverageScores } from '@/utils/dataLoader';

export default function Home() {
  const [latestReport, setLatestReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const report = await fetchLatestReport();
        setLatestReport(report);
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <Loading description="Loading dashboard data..." withOverlay={false} />
        </div>
      </>
    );
  }

  if (error || !latestReport) {
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

  const averageScores = calculateAverageScores(latestReport);
  const reportDate = new Date(latestReport.generatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <Header />
      <main className="page-container">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <div style={{ marginBottom: '3rem' }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>
                Government web performance dashboard
              </h1>
              <p style={{ fontSize: '1.125rem', color: 'var(--cds-text-secondary)', maxWidth: '800px' }}>
                Comprehensive analysis of performance and accessibility metrics for {latestReport.reports.length} government
                websites using Google Lighthouse. Data is updated monthly to track improvements and identify areas
                for optimization.
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', marginTop: '1rem' }}>
                Last updated: {reportDate}
              </p>
            </div>
          </Column>

          <Column lg={16} md={8} sm={4}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              Average scores across all countries
            </h2>
          </Column>

          <Column lg={3} md={4} sm={4}>
            <MetricCard
              title="Performance"
              score={averageScores.performance}
              description="Page load speed and optimization"
            />
          </Column>

          <Column lg={3} md={4} sm={4}>
            <MetricCard
              title="Accessibility"
              score={averageScores.accessibility}
              description="Inclusive design and usability"
            />
          </Column>

          <Column lg={3} md={4} sm={4}>
            <MetricCard
              title="Best Practices"
              score={averageScores.bestPractices}
              description="Web development standards"
            />
          </Column>

          <Column lg={3} md={4} sm={4}>
            <MetricCard
              title="SEO"
              score={averageScores.seo}
              description="Search engine optimization"
            />
          </Column>

          <Column lg={16} md={8} sm={4}>
            <div style={{ marginTop: '3rem', maxWidth: '800px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
                About this dashboard
              </h2>
              <p style={{ marginBottom: '1rem', color: 'var(--cds-text-secondary)' }}>
                This dashboard provides insights into the digital performance of government websites.<br />
                Using Google Lighthouse, we measure four key metrics that impact user experience:
              </p>
              <UnorderedList style={{ marginLeft: '1.5rem', color: 'var(--cds-text-secondary)', lineHeight: 1.6 }}>
                <ListItem><strong>Performance:</strong> How quickly pages load and become interactive</ListItem>
                <ListItem><strong>Accessibility:</strong> How well the site serves users with disabilities</ListItem>
                <ListItem><strong>Best practices:</strong> Adherence to modern web development standards</ListItem>
                <ListItem><strong>SEO:</strong> Search engine discoverability and ranking factors</ListItem>
              </UnorderedList>
              <p style={{ marginTop: '1rem', color: 'var(--cds-text-secondary)' }}>
                Explore the <a href={`${process.env.NODE_ENV === 'production' ? '/gov-web-performance' : ''}/rankings`}>Rankings</a> or
                use the <a href={`${process.env.NODE_ENV === 'production' ? '/gov-web-performance' : ''}/compare`}>Compare</a> tool
                to analyze specific countries in detail.
              </p>
            </div>
          </Column>
        </Grid>
      </main>
    </>
  );
}
