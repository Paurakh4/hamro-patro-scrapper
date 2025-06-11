/**
 * Type definitions for Hamro Patro Scrapper
 */

/**
 * Represents a single day in the Nepali calendar
 */
export interface CalendarDay {
  /** Whether this day is a holiday */
  isHoliday: boolean;
  /** Tithi information (lunar day) */
  tithi?: string;
  /** Event description for this day */
  event?: string;
  /** Day number in Nepali numerals */
  day: string;
  /** Day number in English numerals */
  dayInEn: string;
  /** Corresponding English date */
  en: string;
}

/**
 * Represents a month with its days
 */
export interface CalendarMonth {
  /** Month number (1-12) */
  month: number;
  /** Array of days in this month */
  days: CalendarDay[];
}

/**
 * Represents a full year of calendar data
 */
export type CalendarYear = CalendarMonth[];

/**
 * Complete calendar data structure
 */
export interface CalendarData {
  [year: number]: CalendarYear;
}

/**
 * Configuration options for the scraper
 */
export interface ScraperConfig {
  /** Years to scrape */
  years: number[];
  /** Months to scrape (1-12) */
  months: number[];
  /** Delay between requests in milliseconds */
  requestDelay: number;
  /** Maximum retry attempts for failed requests */
  maxRetries: number;
  /** Timeout for each request in milliseconds */
  timeout: number;
  /** Whether to save individual year files */
  saveIndividualYears: boolean;
}

/**
 * Export format options
 */
export type ExportFormat = 'json' | 'csv' | 'excel';

/**
 * Export configuration
 */
export interface ExportConfig {
  /** Output format */
  format: ExportFormat;
  /** Output file path */
  outputPath: string;
  /** Whether to include all data or just specific fields */
  includeAllFields: boolean;
}

/**
 * CLI command options
 */
export interface CliOptions {
  /** Years to scrape */
  years?: string;
  /** Months to scrape */
  months?: string;
  /** Output format */
  format?: ExportFormat;
  /** Output directory */
  output?: string;
  /** Request delay in milliseconds */
  delay?: string;
  /** Verbose output */
  verbose?: boolean;
  /** Save individual year files */
  individualFiles?: boolean;
  /** Include all fields in export */
  includeAllFields?: boolean;
}

/**
 * Progress tracking interface
 */
export interface ProgressInfo {
  /** Current year being processed */
  currentYear: number;
  /** Current month being processed */
  currentMonth: number;
  /** Total years to process */
  totalYears: number;
  /** Total months to process */
  totalMonths: number;
  /** Completed years */
  completedYears: number;
  /** Completed months in current year */
  completedMonths: number;
}

/**
 * Error types for better error handling
 */
export const ScraperErrorType = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  PARSING_ERROR: 'PARSING_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  FILE_SYSTEM_ERROR: 'FILE_SYSTEM_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR'
} as const;

export type ScraperErrorType = typeof ScraperErrorType[keyof typeof ScraperErrorType];

/**
 * Custom error class for scraper errors
 */
export class ScraperError extends Error {
  constructor(
    public type: ScraperErrorType,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ScraperError';
  }
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  /** Whether the data is valid */
  isValid: boolean;
  /** Array of validation errors */
  errors: string[];
  /** Array of validation warnings */
  warnings: string[];
}

/**
 * Rate limiter configuration
 */
export interface RateLimiterConfig {
  /** Minimum delay between requests in milliseconds */
  minDelay: number;
  /** Maximum delay between requests in milliseconds */
  maxDelay: number;
  /** Whether to use exponential backoff */
  useExponentialBackoff: boolean;
}
