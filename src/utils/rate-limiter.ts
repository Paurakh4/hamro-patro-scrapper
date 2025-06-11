import type { RateLimiterConfig } from '../types.js';

/**
 * Rate limiter to control request frequency and be respectful to the target website
 */
export class RateLimiter {
  private lastRequestTime: number = 0;
  private consecutiveErrors: number = 0;

  constructor(private config: RateLimiterConfig) {}

  /**
   * Wait for the appropriate delay before making the next request
   */
  async waitForNextRequest(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    let delay = this.config.minDelay;
    
    if (this.config.useExponentialBackoff && this.consecutiveErrors > 0) {
      // Exponential backoff for errors: 2^errors * minDelay
      delay = Math.min(
        this.config.minDelay * Math.pow(2, this.consecutiveErrors),
        this.config.maxDelay
      );
    }
    
    const remainingDelay = Math.max(0, delay - timeSinceLastRequest);
    
    if (remainingDelay > 0) {
      await this.sleep(remainingDelay);
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Record a successful request (resets error count)
   */
  recordSuccess(): void {
    this.consecutiveErrors = 0;
  }

  /**
   * Record a failed request (increases error count for backoff)
   */
  recordError(): void {
    this.consecutiveErrors++;
  }

  /**
   * Get current delay that would be applied
   */
  getCurrentDelay(): number {
    if (this.config.useExponentialBackoff && this.consecutiveErrors > 0) {
      return Math.min(
        this.config.minDelay * Math.pow(2, this.consecutiveErrors),
        this.config.maxDelay
      );
    }
    return this.config.minDelay;
  }

  /**
   * Reset the rate limiter state
   */
  reset(): void {
    this.lastRequestTime = 0;
    this.consecutiveErrors = 0;
  }

  /**
   * Sleep for the specified number of milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Create a default rate limiter configuration
 */
export function createDefaultRateLimiterConfig(): RateLimiterConfig {
  return {
    minDelay: 1000, // 1 second minimum delay
    maxDelay: 30000, // 30 seconds maximum delay
    useExponentialBackoff: true
  };
}
