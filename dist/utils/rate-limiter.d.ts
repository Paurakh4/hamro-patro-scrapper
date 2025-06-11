import type { RateLimiterConfig } from '../types.js';
/**
 * Rate limiter to control request frequency and be respectful to the target website
 */
export declare class RateLimiter {
    private config;
    private lastRequestTime;
    private consecutiveErrors;
    constructor(config: RateLimiterConfig);
    /**
     * Wait for the appropriate delay before making the next request
     */
    waitForNextRequest(): Promise<void>;
    /**
     * Record a successful request (resets error count)
     */
    recordSuccess(): void;
    /**
     * Record a failed request (increases error count for backoff)
     */
    recordError(): void;
    /**
     * Get current delay that would be applied
     */
    getCurrentDelay(): number;
    /**
     * Reset the rate limiter state
     */
    reset(): void;
    /**
     * Sleep for the specified number of milliseconds
     */
    private sleep;
}
/**
 * Create a default rate limiter configuration
 */
export declare function createDefaultRateLimiterConfig(): RateLimiterConfig;
//# sourceMappingURL=rate-limiter.d.ts.map