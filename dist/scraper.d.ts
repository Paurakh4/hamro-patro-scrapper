import type { CalendarData, ScraperConfig, ProgressInfo } from './types.js';
/**
 * Modern Hamro Patro scraper with TypeScript, rate limiting, and error handling
 */
export declare class HamroPatroScraper {
    private config;
    private browser;
    private page;
    private rateLimiter;
    constructor(config: ScraperConfig);
    /**
     * Initialize the scraper (launch browser)
     */
    initialize(): Promise<void>;
    /**
     * Scrape calendar data for specified years and months
     */
    scrape(progressCallback?: (progress: ProgressInfo) => void): Promise<CalendarData>;
    /**
     * Scrape data for a specific month
     */
    private scrapeMonth;
    /**
     * Close the browser and cleanup
     */
    close(): Promise<void>;
}
/**
 * Create default scraper configuration
 */
export declare function createDefaultScraperConfig(): ScraperConfig;
//# sourceMappingURL=scraper.d.ts.map