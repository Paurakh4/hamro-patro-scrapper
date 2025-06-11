#!/usr/bin/env node
/**
 * CLI for Hamro Patro Scrapper
 */
declare class HamroPatroCLI {
    private program;
    private progressBar;
    constructor();
    /**
     * Setup CLI commands and options
     */
    private setupCommands;
    /**
     * Handle scrape command
     */
    private handleScrapeCommand;
    /**
     * Handle convert command
     */
    private handleConvertCommand;
    /**
     * Handle validate command
     */
    private handleValidateCommand;
    /**
     * Parse CLI options into scraper configuration
     */
    private parseScraperConfig;
    /**
     * Setup progress bar
     */
    private setupProgressBar;
    /**
     * Update progress bar
     */
    private updateProgress;
    /**
     * Export data in the requested format
     */
    private exportData;
    /**
     * Export data by format
     */
    private exportDataByFormat;
    /**
     * Run the CLI
     */
    run(): void;
}
export { HamroPatroCLI };
//# sourceMappingURL=cli.d.ts.map