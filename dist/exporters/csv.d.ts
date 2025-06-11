import type { CalendarData, ExportConfig } from '../types.js';
/**
 * CSV exporter for calendar data
 */
export declare class CsvExporter {
    /**
     * Export calendar data to CSV format
     */
    export(data: CalendarData, config: ExportConfig): Promise<void>;
    /**
     * Export individual year CSV files
     */
    exportYearFiles(data: CalendarData, outputDir: string): Promise<void>;
    /**
     * Convert calendar data to CSV rows
     */
    private convertToCSVRows;
    /**
     * Ensure directory exists, create if it doesn't
     */
    private ensureDirectoryExists;
}
/**
 * Utility function to export CSV data
 */
export declare function exportToCSV(data: CalendarData, outputPath: string, includeAllFields?: boolean): Promise<void>;
/**
 * Utility function to export individual year CSV files
 */
export declare function exportYearCSVFiles(data: CalendarData, outputDir: string): Promise<void>;
//# sourceMappingURL=csv.d.ts.map