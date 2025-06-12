# Hamro Patro Scrapper v2.0.0

🚀 **Modern TypeScript-based scraper for Hamro Patro (Nepali Calendar)** with multiple export formats, CLI support, and enhanced features.

## ✨ Features

### 🔧 **Modernized Codebase**
- **TypeScript Support**: Full TypeScript implementation with proper type definitions
- **ES Modules**: Modern import/export syntax
- **Latest Puppeteer**: Updated from v1.6.0 to v22.x for better performance and security
- **Security Fixes**: All known vulnerabilities resolved

### 📊 **Multiple Export Formats**
- **JSON**: Traditional format (backward compatible)
- **CSV**: Spreadsheet-friendly format
- **Excel (.xlsx)**: Rich formatting with holiday highlighting and multiple worksheets

### 🖥️ **Command Line Interface**
- **Flexible Year/Month Selection**: Scrape specific years and months
- **Progress Bars**: Real-time scraping progress with cli-progress
- **Multiple Commands**: Scrape, convert, and validate data
- **Verbose Output**: Detailed logging for debugging

### 🛡️ **Enhanced Reliability**
- **Rate Limiting**: Respectful delays between requests (1-30 seconds)
- **Data Validation**: Comprehensive validation of scraped data
- **Error Handling**: Robust error handling with retry mechanisms
- **Type Safety**: Full TypeScript type checking

### 📈 **Data Quality**
- **Validation**: Ensures data integrity and consistency
- **Holiday Detection**: Proper identification of Nepali holidays
- **Tithi Information**: Accurate lunar calendar data
- **Event Details**: Festival and special day information

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/samundrak/hamro-patro-scrapper.git
cd hamro-patro-scrapper

# Install dependencies
npm install

# Build the project
npm run build
```

### Basic Usage

#### 1. **Programmatic Usage**
```bash
# Run with default settings (scrapes current year)
npm start

# Or run the built version
node dist/index.js
```

#### 2. **Command Line Interface**

```bash
# Scrape specific year and months
node dist/cli.js scrape -y 2081 -m 1,2,3 -f json

# Scrape multiple years with CSV output
node dist/cli.js scrape -y 2080,2081 -f csv --verbose

# Scrape with custom delay and individual files
node dist/cli.js scrape -y 2081 -d 2000 --individual-files

# Convert existing JSON to other formats
node dist/cli.js convert -i ./data/data.json -f excel

# Validate existing data
node dist/cli.js validate -i ./data/data.json
```

## 📖 CLI Documentation

### Commands

#### `scrape` - Scrape calendar data
```bash
node dist/cli.js scrape [options]
```

**Options:**
- `-y, --years <years>`: Years to scrape (comma-separated, e.g., 2076,2077)
- `-m, --months <months>`: Months to scrape (comma-separated, 1-12)
- `-f, --format <format>`: Output format (json, csv, excel)
- `-o, --output <path>`: Output directory (default: ./data)
- `-d, --delay <ms>`: Delay between requests in milliseconds
- `--individual-files`: Save individual year files
- `--include-all-fields`: Include all fields in export
- `-v, --verbose`: Verbose output

**Examples:**
```bash
# Scrape year 2081 in CSV format
node dist/cli.js scrape -y 2081 -f csv

# Scrape specific months with verbose output
node dist/cli.js scrape -y 2081 -m 1,2,3,4,5,6 --verbose

# Scrape with 2-second delay between requests
node dist/cli.js scrape -y 2081 -d 2000
```

#### `convert` - Convert existing data
```bash
node dist/cli.js convert -i <input> [options]
```

**Options:**
- `-i, --input <path>`: Input JSON file path (required)
- `-f, --format <format>`: Output format (csv, excel)
- `-o, --output <path>`: Output file path
- `--include-all-fields`: Include all fields in export

**Examples:**
```bash
# Convert JSON to CSV
node dist/cli.js convert -i ./data/data.json -f csv

# Convert to Excel with custom output path
node dist/cli.js convert -i ./data/data.json -f excel -o ./exports/calendar.xlsx
```

#### `validate` - Validate data integrity
```bash
node dist/cli.js validate -i <input>
```

**Examples:**
```bash
# Validate existing JSON data
node dist/cli.js validate -i ./data/data.json
```

## 📁 Output Structure

### Directory Layout
```
data/
├── data.json          # Combined data (all years)
├── data.csv           # CSV format
├── data.xlsx          # Excel format
└── years/             # Individual year files
    ├── 2081.json
    ├── 2081.csv
    └── 2081.xlsx
```

### Data Format

#### JSON Structure
```json
{
  "2081": [
    {
      "month": 1,
      "days": [
        {
          "isHoliday": true,
          "tithi": "पञ्चमी",
          "event": "नयाँ वर्ष/मेष संक्रान्ति",
          "day": "१",
          "dayInEn": "1",
          "en": "13"
        }
      ]
    }
  ]
}
```

#### CSV Columns
- **Year**: Nepali year
- **Month**: Month number (1-12)
- **Nepali Day**: Day in Nepali numerals
- **Day (English)**: Day in English numerals
- **English Date**: Corresponding English date
- **Is Holiday**: Holiday status (Yes/No)
- **Tithi**: Lunar day information
- **Event**: Festival/event description

## 🔧 Development

### Scripts
```bash
npm run build          # Compile TypeScript
npm run dev           # Build and run
npm start             # Run compiled version
npm run clean         # Clean dist directory
npm run lint          # Run ESLint
```

### Project Structure
```
src/
├── types.ts           # TypeScript type definitions
├── index.ts           # Main entry point
├── scraper.ts         # Core scraping logic
├── cli.ts             # Command line interface
├── exporters/         # Export functionality
│   ├── json.ts
│   ├── csv.ts
│   └── excel.ts
└── utils/             # Utility functions
    ├── validation.ts
    └── rate-limiter.ts
```

## 🛠️ Configuration

### Scraper Configuration
```typescript
const config = {
  years: [2081],                    // Years to scrape
  months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // Months
  requestDelay: 1500,               // Delay between requests (ms)
  maxRetries: 3,                    // Maximum retry attempts
  timeout: 30000,                   // Request timeout (ms)
  saveIndividualYears: true         // Save individual year files
};
```

### Rate Limiting
- **Default delay**: 1 second between requests
- **Exponential backoff**: Automatic delay increase on errors
- **Respectful scraping**: Prevents overwhelming the target server

## 📊 Data Validation

The scraper includes comprehensive validation:

- **Data integrity**: Ensures all required fields are present
- **Date consistency**: Validates Nepali-English date mapping
- **Holiday detection**: Verifies holiday flags
- **Sequential validation**: Checks for proper day sequences

## 🔒 Security & Best Practices

- **Updated dependencies**: All packages updated to latest secure versions
- **Rate limiting**: Prevents aggressive scraping
- **Error handling**: Graceful failure handling
- **Type safety**: Full TypeScript coverage
- **Input validation**: Sanitized user inputs

## 💻 Programmatic API

### Basic Usage

```typescript
import {
  HamroPatroScraper,
  createDefaultScraperConfig,
  exportToJson,
  exportToCSV,
  exportToExcel
} from 'hamro-patro-scrapper';

// Create and configure scraper
const config = createDefaultScraperConfig();
config.years = [2081];
config.months = [1, 2, 3]; // First 3 months

const scraper = new HamroPatroScraper(config);
await scraper.initialize();

// Scrape with progress tracking
const data = await scraper.scrape((progress) => {
  console.log(`Progress: ${progress.currentYear}/${progress.currentMonth}`);
});

// Export to different formats
await exportToJson(data, './output/data.json');
await exportToCSV(data, './output/data.csv');
await exportToExcel(data, './output/data.xlsx');

await scraper.close();
```

### Configuration Options

```typescript
interface ScraperConfig {
  years: number[];           // Years to scrape
  months: number[];          // Months to scrape (1-12)
  requestDelay: number;      // Delay between requests (ms)
  maxRetries: number;        // Maximum retry attempts
  timeout: number;           // Request timeout (ms)
  saveIndividualYears: boolean; // Save individual year files
}
```

## 📋 Changelog

### [2.0.0] - 2024-12-19 - Complete Modernization

#### ✨ Added
- **TypeScript Support**: Complete migration with full type definitions
- **ES Modules**: Modern import/export syntax replacing CommonJS
- **CLI Interface**: Full-featured command-line interface
- **Multiple Export Formats**: JSON, CSV, Excel (.xlsx) support
- **Progress Tracking**: Real-time progress bars
- **Data Validation**: Comprehensive validation system
- **Rate Limiting**: Configurable delays (1-30 seconds)
- **Error Handling**: Robust error handling with retry mechanisms

#### 🔄 Changed
- **Puppeteer**: Updated from v1.6.0 to v22.0.0
- **Node.js**: Minimum version requirement increased to 16.0.0
- **Architecture**: Migrated to modular TypeScript structure
- **Build Process**: Added TypeScript compilation

#### 🛡️ Security
- Fixed 7 security vulnerabilities (2 moderate, 2 high, 3 critical)
- Updated all dependencies to latest secure versions
- Implemented proper input validation and sanitization

#### 🐛 Bug Fixes
- Fixed inconsistent date parsing
- Improved holiday detection accuracy
- Better handling of special characters in events
- Enhanced error messages for debugging

### [1.0.0] - 2018-07-XX - Initial Release
- Basic scraping functionality for Hamro Patro
- JSON output format
- Simple configuration through code modification
- Puppeteer v1.6.0 integration

## 🔄 Migration Guide (v1.0.0 → v2.0.0)

### Prerequisites
1. **Node.js**: Ensure Node.js 16+ is installed
2. **Dependencies**: Run `npm install` to update dependencies
3. **Build**: Run `npm run build` to compile TypeScript

### Usage Changes

#### Before (v1.0.0)
```javascript
// Edit index.js manually
const recordsOfYears = [2075];
node index.js
```

#### After (v2.0.0)
```bash
# CLI with options
node dist/cli.js scrape -y 2081 -f csv --verbose

# Programmatic usage
npm start

# Convert existing data
node dist/cli.js convert -i data.json -f excel
```

### Breaking Changes
- **Node.js Version**: Minimum version 16.0.0 required
- **Module System**: ES modules instead of CommonJS
- **Data Validation**: Stricter validation may catch previously unnoticed issues
- **File Structure**: New organized structure with `src/` directory

### Backward Compatibility
- **JSON Format**: Fully compatible with v1.0.0 data
- **Programmatic Usage**: Core functionality preserved
- **Data Schema**: Same data structure maintained

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🙏 Acknowledgments

- **Original Contributors**: [@samundrak](https://github.com/samundrak) For the initial implementation
- **Community**: For feedback and suggestions

---

**Note**: This scraper is for educational purposes only. Please be respectful to the Hamro Patro website and follow their terms of service.
