'use client';

import { useEffect, useState } from 'react';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableContainer,
  Loading,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Grid,
  Column,
} from '@carbon/react';
import { ArrowUp, ArrowDown, Subtract } from '@carbon/icons-react';
import Header from '@/components/Header';
import { MonthlyReport, CountryRanking } from '@/types';
import { fetchAllReports, calculateRankings } from '@/utils/dataLoader';

export default function RankingsPage() {
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const allReports = await fetchAllReports();
        setReports(allReports.sort((a, b) => b.month.localeCompare(a.month)));
      } catch (err) {
        setError('Failed to load rankings data');
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
          <Loading description="Loading rankings..." withOverlay={false} />
        </div>
      </>
    );
  }

  if (error || reports.length === 0) {
    return (
      <>
        <Header />
        <div className="page-container">
          <h1>Error loading rankings</h1>
          <p>{error || 'No data available'}</p>
        </div>
      </>
    );
  }

  const latestReport = reports[0];
  const previousReport = reports.length > 1 ? reports[1] : null;

  const performanceRankings = calculateRankings(latestReport, previousReport, 'performance');
  const accessibilityRankings = calculateRankings(latestReport, previousReport, 'accessibility');
  const bestPracticesRankings = calculateRankings(latestReport, previousReport, 'bestPractices');
  const seoRankings = calculateRankings(latestReport, previousReport, 'seo');


  return (
    <>
      <Header />
      <main className="page-container">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>
                Country rankings
              </h1>
              <p style={{ fontSize: '1.125rem', color: 'var(--cds-text-secondary)' }}>
                Compare how government websites rank across different performance metrics.
                Rankings are updated monthly based on Google Lighthouse audits.
              </p>
            </div>
          </Column>

          <Column lg={16} md={8} sm={4}>
            <Tabs>
              <TabList aria-label="Metric rankings" contained>
                <Tab>Performance</Tab>
                <Tab>Accessibility</Tab>
                <Tab>Best Practices</Tab>
                <Tab>SEO</Tab>

              </TabList>
              <TabPanels>
                <TabPanel>
                  <RankingTable rankings={performanceRankings.rankings} />
                </TabPanel>
                <TabPanel>
                  <RankingTable rankings={accessibilityRankings.rankings} />
                </TabPanel>
                <TabPanel>
                  <RankingTable rankings={bestPracticesRankings.rankings} />
                </TabPanel>
                <TabPanel>
                  <RankingTable rankings={seoRankings.rankings} />
                </TabPanel>

              </TabPanels>
            </Tabs>
          </Column>
        </Grid>
      </main>
    </>
  );
}

function RankingTable({ rankings }: { rankings: CountryRanking[] }) {
  const headers = [
    { key: 'rank', header: 'Rank' },
    { key: 'country', header: 'Country' },
    { key: 'score', header: 'Score' },
    { key: 'change', header: 'Change' },
  ];

  const rows = rankings.map((ranking) => ({
    id: ranking.tld,
    rank: ranking.rank,
    country: ranking.country,
    score: ranking.score,
    change: ranking.change,
    previousRank: ranking.previousRank,
  }));

  return (
    <DataTable rows={rows} headers={headers}>
      {({ rows, headers, getTableProps, getHeaderProps, getRowProps }: any) => (
        <TableContainer>
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                {headers.map((header: any) => (
                  <TableHeader {...getHeaderProps({ header })} key={header.key}>
                    {header.header}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row: any) => (
                <TableRow {...getRowProps({ row })} key={row.id}>
                  {row.cells.map((cell: any) => {
                    if (cell.info.header === 'rank') {
                      return (
                        <TableCell key={cell.id}>
                          <strong style={{ fontSize: '1.125rem' }}>#{cell.value}</strong>
                        </TableCell>
                      );
                    }
                    if (cell.info.header === 'score') {
                      const score = cell.value;
                      let scoreClass = '';
                      if (score >= 90) scoreClass = 'score-excellent';
                      else if (score >= 75) scoreClass = 'score-good';
                      else if (score >= 50) scoreClass = 'score-fair';
                      else scoreClass = 'score-poor';

                      return (
                        <TableCell key={cell.id}>
                          <strong className={scoreClass} style={{ fontSize: '1.125rem' }}>
                            {score}
                          </strong>
                        </TableCell>
                      );
                    }
                    if (cell.info.header === 'change') {
                      const change = row.cells.find((c: any) => c.info.header === 'change').value;
                      const previousRank = rankings.find(r => r.tld === row.id)?.previousRank;

                      if (change === undefined || previousRank === undefined) {
                        return <TableCell key={cell.id}>—</TableCell>;
                      }

                      if (change > 0) {
                        return (
                          <TableCell key={cell.id}>
                            <span className="rank-up" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <ArrowUp size={16} />
                              {change}
                            </span>
                          </TableCell>
                        );
                      } else if (change < 0) {
                        return (
                          <TableCell key={cell.id}>
                            <span className="rank-down" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <ArrowDown size={16} />
                              {Math.abs(change)}
                            </span>
                          </TableCell>
                        );
                      } else {
                        return (
                          <TableCell key={cell.id}>
                            <span className="rank-same" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Subtract size={16} />
                              0
                            </span>
                          </TableCell>
                        );
                      }
                    }
                    return <TableCell key={cell.id}>{cell.value}</TableCell>;
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </DataTable>
  );
}
