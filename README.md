# European Government Website Performance Dashboard

A comprehensive web application built with Next.js and Carbon Design System to analyze and visualize the performance and accessibility metrics of European government websites using Google Lighthouse reports.

🔗 **Live Demo:** [https://alex-ju.github.io/gov-web-performance/](https://alex-ju.github.io/gov-web-performance/)

## Features

- 📊 **Interactive Dashboard** - Overview of average performance metrics across all countries
- 🏆 **Rankings** - Compare countries across 5 key metrics with month-over-month change tracking
- 🔍 **Comparison Tool** - Side-by-side analysis with radar charts and detailed breakdowns
- 🤖 **Automated Audits** - Monthly Lighthouse reports via GitHub Actions
- 📈 **Historical Tracking** - Monitor improvements and trends over time
- ♿ **Accessible Design** - Built with Carbon Design System following WCAG guidelines

## Metrics Tracked

The dashboard tracks five core Google Lighthouse metrics:

1. **Performance** - Page load speed and optimization
2. **Accessibility** - Inclusive design and usability for all users
3. **Best Practices** - Adherence to modern web development standards
4. **SEO** - Search engine optimization and discoverability

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/alex-ju/gov-web-performance.git
   cd gov-web-performance
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lighthouse` - Run Lighthouse audits manually
- `npm run type-check` - Check TypeScript types

## Project Structure

```
gov-web-performance/
├── app/                      # Next.js app directory
│   ├── page.tsx             # Dashboard homepage
│   ├── rankings/            # Rankings page
│   ├── compare/             # Comparison tool
│   └── globals.css          # Global styles with Carbon
├── components/              # Reusable React components
│   ├── Header.tsx           # Navigation header
│   └── MetricCard.tsx       # Metric display card
├── types/                   # TypeScript type definitions
│   └── index.ts             # All interfaces and types
├── utils/                   # Utility functions
│   └── dataLoader.ts        # Data fetching and processing
├── scripts/                 # Automation scripts
│   └── lighthouse-audit.js  # Lighthouse audit runner
├── public/                  # Static assets
│   └── data/
│       ├── countries.json   # List of countries and URLs
│       └── reports/         # Monthly Lighthouse reports
│           ├── manifest.json
│           └── YYYY-MM.json
└── .github/workflows/       # GitHub Actions
    ├── lighthouse-audit.yml # Monthly audit workflow
    └── deploy.yml           # Deployment workflow
```

## Adding New Countries

To add a new country to the dashboard:

1. Edit `public/data/countries.json`
2. Add a new entry with the following format:
   ```json
   {
     "name": "Country Name",
     "url": "https://government-website.tld",
     "tld": "tld"
   }
   ```
3. The next Lighthouse audit will automatically include the new country

## How It Works

### Data Collection

1. **Monthly Audits**: A GitHub Actions workflow runs on the 1st of each month
2. **Lighthouse Execution**: The script audits all government websites listed in `countries.json`
3. **Report Generation**: Results are saved as JSON files in `public/data/reports/`
4. **Automatic Commit**: The workflow commits the new report back to the repository

### Data Loading

- The application dynamically fetches report data at runtime (client-side)
- No rebuild required when new reports are added
- The `manifest.json` file tracks all available reports for discovery

### Deployment

- The application is built as a static site using Next.js `output: 'export'`
- Deployed to GitHub Pages via GitHub Actions on every push to main
- Base path is configured for GitHub Pages hosting

## Extending the Dashboard

### Adding New Metrics

1. Update the `LighthouseMetrics` interface in `types/index.ts`
2. Modify `scripts/lighthouse-audit.js` to extract the new metrics
3. Update components to display the new metrics

### Customizing Visualizations

The dashboard uses Carbon Charts for visualizations. You can:
- Add new chart types (line charts, bar charts, etc.)
- Customize chart options and themes
- Create new comparison views

See the [Carbon Charts documentation](https://charts.carbondesignsystem.com/) for more options.

## GitHub Pages Setup

To deploy this project to GitHub Pages:

1. Enable GitHub Pages in your repository settings
2. Set the source to "GitHub Actions"
3. Push to the main branch to trigger deployment
4. The site will be available at `https://[username].github.io/gov-web-performance/`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Google Lighthouse](https://github.com/GoogleChrome/lighthouse) for the auditing engine
- [Carbon Design System](https://carbondesignsystem.com/) for the UI components
- European government websites for providing public services online

## Contact

For questions or feedback, please [open an issue](https://github.com/alex-ju/gov-web-performance/issues).
