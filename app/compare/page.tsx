'use client';

import { useEffect, useState } from 'react';
import {
  Grid,
  Column,
  Loading,
  MultiSelect,
  Tile,
} from '@carbon/react';
import { RadarChart } from '@carbon/charts-react';
import Header from '@/components/Header';
import MetricCard from '@/components/MetricCard';
import { Country, MonthlyReport, CountryReport } from '@/types';
import { fetchCountries, fetchLatestReport } from '@/utils/dataLoader';

export default function ComparePage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [latestReport, setLatestReport] = useState<MonthlyReport | null>(null);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [countriesData, report] = await Promise.all([
          fetchCountries(),
          fetchLatestReport(),
        ]);
        setCountries(countriesData);
        setLatestReport(report);

        // Pre-select first 3 countries for demo
        if (countriesData.length >= 3) {
          setSelectedCountries([
            countriesData[10].tld,
            countriesData[20].tld,
            countriesData[22].tld,
          ]);
        }
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
          <Loading description="Loading comparison data..." withOverlay={false} />
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

  const countryItems = countries.map(c => ({
    id: c.tld,
    label: c.name,
  }));

  const selectedReports = selectedCountries
    .map(tld => latestReport.reports.find(r => r.tld === tld))
    .filter((r): r is CountryReport => r !== undefined);

  // Prepare radar chart data
  const radarData = selectedReports.flatMap(report => [
    { country: report.country, metric: 'Performance', value: report.metrics.performance },
    { country: report.country, metric: 'Accessibility', value: report.metrics.accessibility },
    { country: report.country, metric: 'Best Practices', value: report.metrics.bestPractices },
    { country: report.country, metric: 'SEO', value: report.metrics.seo },

  ]);

  const radarOptions = {
    title: 'Overall Metrics Comparison',
    radar: {
      axes: {
        angle: 'metric',
        value: 'value',
      },
    },
    data: {
      groupMapsTo: 'country',
    },
    height: '500px',
  };

  return (
    <>
      <Header />
      <main className="page-container">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>
                Compare countries
              </h1>
              <p style={{ fontSize: '1.125rem', color: 'var(--cds-text-secondary)', marginBottom: '2rem' }}>
                Select multiple countries to compare their performance and accessibility metrics side by side.
              </p>
            </div>
          </Column>

          <Column lg={8} md={8} sm={4}>
            <div style={{ marginBottom: '2rem' }}>
              <MultiSelect
                id="country-selector"
                titleText="Select countries to compare"
                label="Choose countries"
                items={countryItems}
                itemToString={(item) => (item ? item.label : '')}
                selectedItems={countryItems.filter(item => selectedCountries.includes(item.id))}
                onChange={({ selectedItems }: any) => {
                  setSelectedCountries(selectedItems.map((item: any) => item.id));
                }}
              />
            </div>
          </Column>

          {selectedReports.length > 0 && (
            <>
              <Column lg={16} md={8} sm={4}>
                <div className="chart-container">
                  <RadarChart data={radarData} options={radarOptions} />
                </div>
              </Column>

              {selectedReports.map(report => (
                <Column lg={16} md={8} sm={4} key={report.tld}>
                  <Tile style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                      {report.country}
                    </h2>
                    <Grid condensed>
                      <Column lg={3} md={4} sm={4}>
                        <MetricCard
                          title="Performance"
                          score={report.metrics.performance}
                        />
                      </Column>
                      <Column lg={3} md={4} sm={4}>
                        <MetricCard
                          title="Accessibility"
                          score={report.metrics.accessibility}
                        />
                      </Column>
                      <Column lg={3} md={4} sm={4}>
                        <MetricCard
                          title="Best Practices"
                          score={report.metrics.bestPractices}
                        />
                      </Column>
                      <Column lg={3} md={4} sm={4}>
                        <MetricCard
                          title="SEO"
                          score={report.metrics.seo}
                        />
                      </Column>

                    </Grid>
                  </Tile>
                </Column>
              ))}
            </>
          )}

          {selectedReports.length === 0 && (
            <Column lg={16} md={8} sm={4}>
              <Tile style={{ padding: '3rem', textAlign: 'center' }}>
                <p style={{ fontSize: '1.125rem', color: 'var(--cds-text-secondary)' }}>
                  Select countries from the dropdown above to start comparing their metrics.
                </p>
              </Tile>
            </Column>
          )}
        </Grid>
      </main>
    </>
  );
}
