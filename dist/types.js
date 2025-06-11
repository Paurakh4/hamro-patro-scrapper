/**
 * Type definitions for Hamro Patro Scrapper
 */
/**
 * Error types for better error handling
 */
export const ScraperErrorType = {
    NETWORK_ERROR: 'NETWORK_ERROR',
    PARSING_ERROR: 'PARSING_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    FILE_SYSTEM_ERROR: 'FILE_SYSTEM_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR'
};
/**
 * Custom error class for scraper errors
 */
export class ScraperError extends Error {
    type;
    originalError;
    constructor(type, message, originalError) {
        super(message);
        this.type = type;
        this.originalError = originalError;
        this.name = 'ScraperError';
    }
}
//# sourceMappingURL=types.js.map