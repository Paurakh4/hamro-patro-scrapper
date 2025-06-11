import puppeteer from 'puppeteer';
import { ScraperError, ScraperErrorType } from './types.js';
import { RateLimiter, createDefaultRateLimiterConfig } from './utils/rate-limiter.js';
import { validateCalendarMonth } from './utils/validation.js';
/**
 * Modern Hamro Patro scraper with TypeScript, rate limiting, and error handling
 */
export class HamroPatroScraper {
    config;
    browser = null;
    page = null;
    rateLimiter;
    constructor(config) {
        this.config = config;
        this.rateLimiter = new RateLimiter(createDefaultRateLimiterConfig());
    }
    /**
     * Initialize the scraper (launch browser)
     */
    async initialize() {
        try {
            this.browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            this.page = await this.browser.newPage();
            // Set user agent to appear more like a regular browser
            await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            // Set viewport
            await this.page.setViewport({ width: 1280, height: 720 });
        }
        catch (error) {
            throw new ScraperError(ScraperErrorType.NETWORK_ERROR, 'Failed to initialize browser', error);
        }
    }
    /**
     * Scrape calendar data for specified years and months
     */
    async scrape(progressCallback) {
        if (!this.page) {
            throw new ScraperError(ScraperErrorType.NETWORK_ERROR, 'Scraper not initialized. Call initialize() first.');
        }
        const data = {};
        const totalYears = this.config.years.length;
        const totalMonths = this.config.months.length;
        for (let yearIndex = 0; yearIndex < this.config.years.length; yearIndex++) {
            const year = this.config.years[yearIndex];
            data[year] = [];
            for (let monthIndex = 0; monthIndex < this.config.months.length; monthIndex++) {
                const month = this.config.months[monthIndex];
                // Update progress
                if (progressCallback) {
                    progressCallback({
                        currentYear: year,
                        currentMonth: month,
                        totalYears,
                        totalMonths,
                        completedYears: yearIndex,
                        completedMonths: monthIndex
                    });
                }
                try {
                    const monthData = await this.scrapeMonth(year, month);
                    data[year].push(monthData);
                    this.rateLimiter.recordSuccess();
                }
                catch (error) {
                    this.rateLimiter.recordError();
                    if (error instanceof ScraperError) {
                        throw error;
                    }
                    throw new ScraperError(ScraperErrorType.PARSING_ERROR, `Failed to scrape year ${year}, month ${month}`, error);
                }
                // Rate limiting
                await this.rateLimiter.waitForNextRequest();
            }
        }
        return data;
    }
    /**
     * Scrape data for a specific month
     */
    async scrapeMonth(year, month) {
        if (!this.page) {
            throw new ScraperError(ScraperErrorType.NETWORK_ERROR, 'Page not available');
        }
        const url = `https://www.hamropatro.com/calendar/${year}/${month}/`;
        try {
            // Navigate to the page with timeout
            await this.page.goto(url, {
                waitUntil: 'networkidle2',
                timeout: this.config.timeout
            });
            // Extract calendar data
            const days = await this.page.evaluate(() => {
                // Nepali to English number mapping
                const nepaliToEnglishMap = new Map([
                    ['०', '0'], ['१', '1'], ['२', '2'], ['३', '3'], ['४', '4'],
                    ['५', '5'], ['६', '6'], ['७', '7'], ['८', '8'], ['९', '9']
                ]);
                function convertNepaliToEnglish(nepaliStr) {
                    return nepaliStr
                        .split('')
                        .map(char => nepaliToEnglishMap.get(char) || char)
                        .join('');
                }
                // Select calendar days (excluding disabled ones)
                const dayElements = Array.from(document.querySelectorAll('.calendar .dates li:not(.disable)')).filter(element => !element.classList.contains('disable'));
                return dayElements.map(element => {
                    const tithiElement = element.querySelector('span.tithi');
                    const eventElement = element.querySelector('span.event');
                    const nepaliDayElement = element.querySelector('span.nep');
                    const englishDayElement = element.querySelector('span.eng');
                    const nepaliDay = nepaliDayElement?.textContent?.trim() || '';
                    const englishDay = englishDayElement?.textContent?.trim() || '';
                    const tithi = tithiElement?.textContent?.trim() || '';
                    const event = eventElement?.textContent?.trim() || '--';
                    return {
                        isHoliday: element.classList.contains('holiday'),
                        tithi: tithi || undefined,
                        event: event === '--' ? undefined : event,
                        day: nepaliDay,
                        dayInEn: convertNepaliToEnglish(nepaliDay),
                        en: englishDay
                    };
                });
            });
            const monthData = {
                month,
                days: days
            };
            // Validate the scraped data
            const validation = validateCalendarMonth(monthData, month - 1);
            if (!validation.isValid) {
                throw new ScraperError(ScraperErrorType.VALIDATION_ERROR, `Validation failed for ${year}/${month}: ${validation.errors.join(', ')}`);
            }
            return monthData;
        }
        catch (error) {
            if (error instanceof ScraperError) {
                throw error;
            }
            // Handle timeout errors
            if (error instanceof Error && error.message.includes('timeout')) {
                throw new ScraperError(ScraperErrorType.TIMEOUT_ERROR, `Timeout while scraping ${url}`, error);
            }
            throw new ScraperError(ScraperErrorType.NETWORK_ERROR, `Failed to scrape ${url}`, error);
        }
    }
    /**
     * Close the browser and cleanup
     */
    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.page = null;
        }
    }
}
/**
 * Create default scraper configuration
 */
export function createDefaultScraperConfig() {
    return {
        years: [2076], // Default to current Nepali year
        months: Array.from({ length: 12 }, (_, i) => i + 1), // All months
        requestDelay: 1000,
        maxRetries: 3,
        timeout: 30000,
        saveIndividualYears: true
    };
}
//# sourceMappingURL=scraper.js.map