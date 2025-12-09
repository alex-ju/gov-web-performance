import CountryAuditClient from './CountryAuditClient';

// Generate static paths for all countries at build time
export async function generateStaticParams() {
  // During build, we need to read the file from the file system
  const fs = require('fs');
  const path = require('path');

  const countriesPath = path.join(process.cwd(), 'public', 'data', 'countries.json');
  const countriesData = JSON.parse(fs.readFileSync(countriesPath, 'utf8'));

  return countriesData.countries.map((country: { tld: string }) => ({
    tld: country.tld,
  }));
}

export default async function CountryAuditPage({ params }: { params: Promise<{ tld: string }> }) {
  const { tld } = await params;
  return <CountryAuditClient tld={tld} />;
}
