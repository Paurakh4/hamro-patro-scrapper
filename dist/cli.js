#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import cliProgress from 'cli-progress';
import { promises as fs } from 'fs';
import { HamroPatroScraper, createDefaultScraperConfig } from './scraper.js';
import { exportToJson, exportYearJsonFiles } from './exporters/json.js';
import { exportToCSV, exportYearCSVFiles } from './exporters/csv.js';
import { exportToExcel, exportYearExcelFiles } from './exporters/excel.js';
import { validateScrapedData } from './utils/validation.js';
/**
 * CLI for Hamro Patro Scrapper
 */
class HamroPatroCLI {
    program;
    progressBar = null;
    constructor() {
        this.program = new Command();
        this.setupCommands();
    }
    /**
     * Setup CLI commands and options
     */
    setupCommands() {
        this.program
            .name('hamro-patro-scrapper')
            .description('Modern TypeScript-based scraper for Hamro Patro (Nepali Calendar)')
            .version('2.0.0');
        this.program
            .command('scrape')
            .description('Scrape calendar data from Hamro Patro')
            .option('-y, --years <years>', 'Years to scrape (comma-separated, e.g., 2076,2077)', '2081')
            .option('-m, --months <months>', 'Months to scrape (comma-separated, 1-12)', '1,2,3,4,5,6,7,8,9,10,11,12')
            .option('-f, --format <format>', 'Output format (json, csv, excel)', 'json')
            .option('-o, --output <path>', 'Output directory', './data')
            .option('-d, --delay <ms>', 'Delay between requests in milliseconds', '1000')
            .option('--individual-files', 'Save individual year files', false)
            .option('--include-all-fields', 'Include all fields in export', true)
            .option('-v, --verbose', 'Verbose output', false)
            .action(async (options) => {
            await this.handleScrapeCommand(options);
        });
        this.program
            .command('convert')
            .description('Convert existing JSON data to other formats')
            .requiredOption('-i, --input <path>', 'Input JSON file path')
            .option('-f, --format <format>', 'Output format (csv, excel)', 'csv')
            .option('-o, --output <path>', 'Output file path')
            .option('--include-all-fields', 'Include all fields in export', true)
            .action(async (options) => {
            await this.handleConvertCommand(options);
        });
        this.program
            .command('validate')
            .description('Validate existing JSON data')
            .requiredOption('-i, --input <path>', 'Input JSON file path')
            .action(async (options) => {
            await this.handleValidateCommand(options);
        });
    }
    /**
     * Handle scrape command
     */
    async handleScrapeCommand(options) {
        try {
            console.log(chalk.blue('🚀 Starting Hamro Patro Scraper...'));
            // Parse options
            const config = this.parseScraperConfig(options);
            if (options.verbose) {
                console.log(chalk.gray('Configuration:'));
                console.log(chalk.gray(`  Years: ${config.years.join(', ')}`));
                console.log(chalk.gray(`  Months: ${config.months.join(', ')}`));
                console.log(chalk.gray(`  Format: ${options.format}`));
                console.log(chalk.gray(`  Output: ${options.output}`));
                console.log(chalk.gray(`  Delay: ${config.requestDelay}ms`));
            }
            // Initialize scraper
            const scraper = new HamroPatroScraper(config);
            await scraper.initialize();
            // Setup progress bar
            this.setupProgressBar(config);
            // Start scraping
            console.log(chalk.yellow('📡 Scraping calendar data...'));
            const data = await scraper.scrape((progress) => {
                this.updateProgress(progress, config);
            });
            // Close progress bar
            if (this.progressBar) {
                this.progressBar.stop();
            }
            // Validate data
            console.log(chalk.yellow('✅ Validating scraped data...'));
            const validation = validateScrapedData(data);
            if (!validation.isValid) {
                console.log(chalk.red('❌ Data validation failed:'));
                validation.errors.forEach(error => console.log(chalk.red(`  • ${error}`)));
                process.exit(1);
            }
            if (validation.warnings.length > 0 && options.verbose) {
                console.log(chalk.yellow('⚠️  Validation warnings:'));
                validation.warnings.forEach(warning => console.log(chalk.yellow(`  • ${warning}`)));
            }
            // Export data
            await this.exportData(data, options);
            // Cleanup
            await scraper.close();
            console.log(chalk.green('✅ Scraping completed successfully!'));
        }
        catch (error) {
            if (this.progressBar) {
                this.progressBar.stop();
            }
            console.error(chalk.red('❌ Error during scraping:'));
            console.error(chalk.red(error instanceof Error ? error.message : String(error)));
            process.exit(1);
        }
    }
    /**
     * Handle convert command
     */
    async handleConvertCommand(options) {
        try {
            console.log(chalk.blue('🔄 Converting data...'));
            // Read input file
            const inputData = await fs.readFile(options.input, 'utf8');
            const data = JSON.parse(inputData);
            // Determine output path
            const outputPath = options.output || options.input.replace('.json', `.${options.format === 'excel' ? 'xlsx' : options.format}`);
            // Export in requested format
            await this.exportDataByFormat(data, options.format, outputPath, options.includeAllFields);
            console.log(chalk.green(`✅ Data converted to ${options.format} format: ${outputPath}`));
        }
        catch (error) {
            console.error(chalk.red('❌ Error during conversion:'));
            console.error(chalk.red(error instanceof Error ? error.message : String(error)));
            process.exit(1);
        }
    }
    /**
     * Handle validate command
     */
    async handleValidateCommand(options) {
        try {
            console.log(chalk.blue('🔍 Validating data...'));
            // Read input file
            const inputData = await fs.readFile(options.input, 'utf8');
            const data = JSON.parse(inputData);
            // Validate data
            const validation = validateScrapedData(data);
            if (validation.isValid) {
                console.log(chalk.green('✅ Data validation passed!'));
            }
            else {
                console.log(chalk.red('❌ Data validation failed:'));
                validation.errors.forEach(error => console.log(chalk.red(`  • ${error}`)));
            }
            if (validation.warnings.length > 0) {
                console.log(chalk.yellow('⚠️  Validation warnings:'));
                validation.warnings.forEach(warning => console.log(chalk.yellow(`  • ${warning}`)));
            }
            // Print summary
            const years = Object.keys(data);
            const totalDays = years.reduce((sum, year) => {
                return sum + data[year].reduce((monthSum, month) => monthSum + month.days.length, 0);
            }, 0);
            console.log(chalk.blue('\n📊 Data Summary:'));
            console.log(chalk.gray(`  Years: ${years.join(', ')}`));
            console.log(chalk.gray(`  Total Days: ${totalDays}`));
        }
        catch (error) {
            console.error(chalk.red('❌ Error during validation:'));
            console.error(chalk.red(error instanceof Error ? error.message : String(error)));
            process.exit(1);
        }
    }
    /**
     * Parse CLI options into scraper configuration
     */
    parseScraperConfig(options) {
        const config = createDefaultScraperConfig();
        if (options.years) {
            config.years = options.years.split(',').map(y => parseInt(y.trim(), 10));
        }
        if (options.months) {
            config.months = options.months.split(',').map(m => parseInt(m.trim(), 10));
        }
        if (options.delay) {
            config.requestDelay = parseInt(options.delay.toString(), 10);
        }
        return config;
    }
    /**
     * Setup progress bar
     */
    setupProgressBar(config) {
        const totalOperations = config.years.length * config.months.length;
        this.progressBar = new cliProgress.SingleBar({
            format: 'Progress |{bar}| {percentage}% | {value}/{total} | Year: {year} Month: {month}',
            barCompleteChar: '\u2588',
            barIncompleteChar: '\u2591',
            hideCursor: true
        });
        this.progressBar.start(totalOperations, 0, {
            year: 'N/A',
            month: 'N/A'
        });
    }
    /**
     * Update progress bar
     */
    updateProgress(progress, config) {
        if (this.progressBar) {
            const completed = progress.completedYears * config.months.length + progress.completedMonths;
            this.progressBar.update(completed, {
                year: progress.currentYear,
                month: progress.currentMonth
            });
        }
    }
    /**
     * Export data in the requested format
     */
    async exportData(data, options) {
        const outputDir = options.output || './data';
        const format = options.format || 'json';
        const includeAllFields = options.includeAllFields !== false;
        console.log(chalk.yellow(`💾 Exporting data in ${format} format...`));
        // Create output directory
        await fs.mkdir(outputDir, { recursive: true });
        if (options.individualFiles) {
            // Export individual year files
            switch (format) {
                case 'json':
                    await exportYearJsonFiles(data, `${outputDir}/years`);
                    break;
                case 'csv':
                    await exportYearCSVFiles(data, `${outputDir}/years`);
                    break;
                case 'excel':
                    await exportYearExcelFiles(data, `${outputDir}/years`);
                    break;
            }
            console.log(chalk.green(`📁 Individual year files saved to ${outputDir}/years/`));
        }
        // Export combined file
        const outputPath = `${outputDir}/data.${format === 'excel' ? 'xlsx' : format}`;
        await this.exportDataByFormat(data, format, outputPath, includeAllFields);
        console.log(chalk.green(`📄 Combined data saved to ${outputPath}`));
    }
    /**
     * Export data by format
     */
    async exportDataByFormat(data, format, outputPath, includeAllFields) {
        switch (format) {
            case 'json':
                await exportToJson(data, outputPath, includeAllFields);
                break;
            case 'csv':
                await exportToCSV(data, outputPath, includeAllFields);
                break;
            case 'excel':
                await exportToExcel(data, outputPath, includeAllFields);
                break;
            default:
                throw new Error(`Unsupported format: ${format}`);
        }
    }
    /**
     * Run the CLI
     */
    run() {
        this.program.parse();
    }
}
// Run CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const cli = new HamroPatroCLI();
    cli.run();
}
export { HamroPatroCLI };
//# sourceMappingURL=cli.js.map