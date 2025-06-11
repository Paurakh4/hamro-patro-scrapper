/**
 * Hamro Patro Scrapper - Modern TypeScript-based scraper
 * 
 * This is the main entry point for the library when used programmatically.
 * For CLI usage, use the cli.ts file.
 */

import chalk from 'chalk';
import cliProgress from 'cli-progress';
import { HamroPatroScraper, createDefaultScraperConfig } from './scraper.js';
import { exportToJson, exportYearJsonFiles } from './exporters/json.js';
import { exportToCSV } from './exporters/csv.js';
import { exportToExcel } from './exporters/excel.js';
import { validateScrapedData } from './utils/validation.js';
import type { ProgressInfo } from './types.js';

/**
 * Main scraping function with default configuration
 */
async function main(): Promise<void> {
  console.log(chalk.blue('🚀 Hamro Patro Scrapper v2.0.0'));
  console.log(chalk.gray('Modern TypeScript-based scraper for Nepali Calendar data\n'));

  try {
    // Create default configuration
    const config = createDefaultScraperConfig();
    
    // You can modify the configuration here
    config.years = [2081]; // Current Nepali year
    config.months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; // All months
    config.requestDelay = 1500; // 1.5 seconds between requests
    
    console.log(chalk.yellow('📋 Configuration:'));
    console.log(chalk.gray(`  Years: ${config.years.join(', ')}`));
    console.log(chalk.gray(`  Months: ${config.months.join(', ')}`));
    console.log(chalk.gray(`  Request delay: ${config.requestDelay}ms`));
    console.log('');

    // Initialize scraper
    console.log(chalk.yellow('🔧 Initializing scraper...'));
    const scraper = new HamroPatroScraper(config);
    await scraper.initialize();

    // Setup progress tracking
    const totalOperations = config.years.length * config.months.length;
    const progressBar = new cliProgress.SingleBar({
      format: 'Progress |{bar}| {percentage}% | {value}/{total} | Year: {year} Month: {month}',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true
    });

    progressBar.start(totalOperations, 0, {
      year: 'N/A',
      month: 'N/A'
    });

    // Start scraping with progress tracking
    console.log(chalk.yellow('📡 Scraping calendar data...'));
    const data = await scraper.scrape((progress: ProgressInfo) => {
      const completed = progress.completedYears * config.months.length + progress.completedMonths;
      progressBar.update(completed, {
        year: progress.currentYear,
        month: progress.currentMonth
      });
    });

    progressBar.stop();

    // Validate scraped data
    console.log(chalk.yellow('✅ Validating scraped data...'));
    const validation = validateScrapedData(data);
    
    if (!validation.isValid) {
      console.log(chalk.red('❌ Data validation failed:'));
      validation.errors.forEach(error => console.log(chalk.red(`  • ${error}`)));
      process.exit(1);
    }

    if (validation.warnings.length > 0) {
      console.log(chalk.yellow('⚠️  Validation warnings:'));
      validation.warnings.forEach(warning => console.log(chalk.yellow(`  • ${warning}`)));
    }

    // Export data in multiple formats
    console.log(chalk.yellow('💾 Exporting data...'));

    // JSON export (backward compatibility)
    await exportToJson(data, './data/data.json', true);
    console.log(chalk.green('  ✓ JSON: ./data/data.json'));

    // Individual year JSON files (backward compatibility)
    if (config.saveIndividualYears) {
      await exportYearJsonFiles(data, './data/years');
      console.log(chalk.green('  ✓ Individual JSON files: ./data/years/'));
    }

    // CSV export
    await exportToCSV(data, './data/data.csv', true);
    console.log(chalk.green('  ✓ CSV: ./data/data.csv'));

    // Excel export
    await exportToExcel(data, './data/data.xlsx', true);
    console.log(chalk.green('  ✓ Excel: ./data/data.xlsx'));

    // Print summary
    const years = Object.keys(data);
    const totalDays = years.reduce((sum, year) => {
      const yearData = data[parseInt(year)];
      if (yearData) {
        return sum + yearData.reduce((monthSum, month) => monthSum + month.days.length, 0);
      }
      return sum;
    }, 0);

    const totalHolidays = years.reduce((sum, year) => {
      const yearData = data[parseInt(year)];
      if (yearData) {
        return sum + yearData.reduce((monthSum, month) => {
          return monthSum + month.days.filter(day => day.isHoliday).length;
        }, 0);
      }
      return sum;
    }, 0);

    console.log(chalk.blue('\n📊 Summary:'));
    console.log(chalk.gray(`  Years processed: ${years.join(', ')}`));
    console.log(chalk.gray(`  Total days: ${totalDays}`));
    console.log(chalk.gray(`  Total holidays: ${totalHolidays}`));
    console.log(chalk.gray(`  Working days: ${totalDays - totalHolidays}`));

    // Cleanup
    await scraper.close();

    console.log(chalk.green('\n✅ Scraping completed successfully!'));
    console.log(chalk.gray('Data has been saved in JSON, CSV, and Excel formats.'));

  } catch (error) {
    console.error(chalk.red('\n❌ Error during scraping:'));
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    
    if (error instanceof Error && error.stack) {
      console.error(chalk.gray('\nStack trace:'));
      console.error(chalk.gray(error.stack));
    }
    
    process.exit(1);
  }
}

// Export main components for programmatic use
export {
  HamroPatroScraper,
  createDefaultScraperConfig,
  exportToJson,
  exportToCSV,
  exportToExcel,
  validateScrapedData
};

export * from './types.js';

// Run main function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}
