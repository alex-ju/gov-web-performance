# Government Web Performance

A web application that analyzes and visualizes the performance and accessibility metrics of European government websites using Google Lighthouse.

## Overview

This project automatically generates Google Lighthouse reports for government websites across 45 European countries and displays the results in an interactive scatter plot visualization. It helps compare web performance and accessibility scores across different government portals.

## Features

- **Automated Lighthouse Testing**: Runs Google Lighthouse audits on government websites from 45 European countries
- **Performance Metrics**: Captures performance scores, accessibility scores, and screenshots
- **Interactive Visualization**: Displays results in a Highcharts scatter plot showing the relationship between performance and accessibility
- **Data Persistence**: Stores Lighthouse reports as JSON files for historical tracking
- **Express Web Server**: Serves an interactive dashboard to view and compare results

## Installation

```bash
npm install
```

## Usage

### 1. Generate Lighthouse Reports

Run the Lighthouse script to analyze all government websites listed in `data/countries.json`:

```bash
npm run lighthouse
```

This will:
- Iterate through all 45 European government websites
- Run Google Lighthouse audits on each site
- Save the results as JSON files in the `data/` directory (e.g., `uk.json`, `de.json`, etc.)
- Skip websites that already have existing reports

**Note**: This process can take a significant amount of time as it runs full Lighthouse audits on each website.

### 2. Start the Web Application

Launch the Express server to view the interactive dashboard:

```bash
npm start
```

Then open your browser and navigate to `http://localhost:3000` to see:
- An interactive scatter plot comparing performance vs. accessibility scores
- Country labels (using TLD codes like UK, DE, FR)
- Tooltips showing detailed metrics for each country
- The ability to zoom and explore the data

## Project Structure

```
gov-web-performance/
├── bin/
│   ├── lighthouse      # Script to generate Lighthouse reports
│   └── www             # Express server startup script
├── data/
│   ├── countries.json  # List of 45 European government websites
│   └── *.json          # Individual Lighthouse reports per country
├── routes/
│   └── index.js        # Express route handlers
├── views/
│   ├── header.ejs      # Page header template
│   ├── footer.ejs      # Page footer template
│   ├── index.ejs       # Main dashboard with Highcharts visualization
│   └── error.ejs       # Error page template
├── public/             # Static assets
├── app.js              # Express application configuration
└── package.json        # Project dependencies and scripts

```

## How It Works

1. **Data Collection**: The `bin/lighthouse` script reads the list of government websites from `data/countries.json`
2. **Lighthouse Audits**: For each website, it runs `npx lighthouse [url] --output json` and saves the results
3. **Data Processing**: The Express app reads all JSON reports and extracts performance and accessibility scores
4. **Visualization**: The scores are plotted on an interactive Highcharts scatter plot where:
   - X-axis = Performance score (0-100)
   - Y-axis = Accessibility score (0-100)
   - Each point represents a country (labeled with its TLD)

## Technologies Used

- **Node.js & Express**: Web server framework
- **Google Lighthouse**: Web performance auditing tool
- **Highcharts**: Interactive data visualization
- **EJS**: Templating engine for server-side rendering

## Resources

- [Google Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [MDN: Measuring Performance](https://developer.mozilla.org/en-US/docs/Learn/Performance/Measuring_performance)
- [MDN: What is Web Performance](https://developer.mozilla.org/en-US/docs/Learn/Performance/What_is_web_performance)

## License

MIT
