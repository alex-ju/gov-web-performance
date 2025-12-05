# Governments web performance dashboard

A web application built with Next.js and Carbon Design System to analyze and visualize the performance and accessibility metrics of government websites using Google Lighthouse reports.

## Features

- 📊 **Dashboard** - Overview of average performance metrics across all countries
- 🏆 **Rankings** - Compare countries across 4 key metrics with month-over-month change tracking
- 🔍 **Comparison** - Side-by-side analysis with radar charts and detailed breakdowns
- 🤖 **Audits** - Monthly Lighthouse reports via GitHub Actions
- 📈 **Tracking** - Monitor improvements and trends over time
- ♿ **Accessible** - Built following WCAG guidelines

## Metrics

The dashboard tracks four core Google Lighthouse metrics:

- **Performance**
- **Accessibility**
- **Best practices**
- **SEO**

## Getting started

### Prerequisites

- Node.js 20 or higher
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lighthouse` - Run Lighthouse audits manually
- `npm run type-check` - Check TypeScript types

### Project structure

```
gov-web-performance/
├── app/                     # Next.js app directory
├── components/              # Reusable React components
├── types/                   # TypeScript type definitions
├── utils/                   # Utility functions
├── scripts/                 # Automation scripts
├── public/                  # Static assets
├── .github/workflows/       # GitHub Actions
```

### Adding new countries

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

## How it works

### Data collection

1. **Monthly audits**: A GitHub Actions workflow runs on the 1st of each month
2. **Lighthouse execution**: The script audits all government websites listed in `countries.json`
3. **Report generation**: Results are saved as JSON files in `public/data/reports/`
4. **Automatic commit**: The workflow commits the new report back to the repository

### Data loading

- The application dynamically fetches report data at runtime (client-side)
- No rebuild required when new reports are added
- The `manifest.json` file tracks all available reports for discovery

### Deployment

- The application is built as a static site using Next.js `output: 'export'`
- Deployed to GitHub Pages via GitHub Actions on every push to main
- Base path is configured for GitHub Pages hosting

### Extending the dashboard

#### Adding new metrics

1. Update the `LighthouseMetrics` interface in `types/index.ts`
2. Modify `scripts/lighthouse-audit.js` to extract the new metrics
3. Update components to display the new metrics

#### Customizing visualizations

The dashboard uses Carbon Charts for visualizations. You can:
- Add new chart types (line charts, bar charts, etc.)
- Customize chart options and themes
- Create new comparison views

See the [Carbon Charts documentation](https://charts.carbondesignsystem.com/) for more options.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Google Lighthouse](https://github.com/GoogleChrome/lighthouse) for the auditing engine
- [Carbon Design System](https://carbondesignsystem.com/) for the UI components
- Government websites for providing public services online

## Contact

For questions or feedback, please [open an issue](https://github.com/alex-ju/gov-web-performance/issues).
