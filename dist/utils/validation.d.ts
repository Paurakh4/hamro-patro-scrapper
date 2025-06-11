import type { CalendarDay, CalendarMonth, CalendarYear, ValidationResult } from '../types.js';
/**
 * Validation utilities for scraped calendar data
 */
/**
 * Validate a single calendar day
 */
export declare function validateCalendarDay(day: CalendarDay, dayIndex: number): ValidationResult;
/**
 * Validate a calendar month
 */
export declare function validateCalendarMonth(month: CalendarMonth, monthIndex: number): ValidationResult;
/**
 * Validate a full calendar year
 */
export declare function validateCalendarYear(year: CalendarYear, yearNumber: number): ValidationResult;
/**
 * Convert Nepali numerals to English numerals
 */
export declare function convertNepaliToEnglish(nepaliStr: string): string;
/**
 * Validate scraped data and return comprehensive results
 */
export declare function validateScrapedData(data: unknown): ValidationResult;
//# sourceMappingURL=validation.d.ts.map