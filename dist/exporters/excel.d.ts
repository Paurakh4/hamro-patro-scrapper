import type { CalendarData, ExportConfig } from '../types.js';
/**
 * Excel exporter for calendar data
 */
export declare class ExcelExporter {
    /**
     * Export calendar data to Excel format
     */
    export(data: CalendarData, config: ExportConfig): Promise<void>;
    /**
     * Export individual year Excel files
     */
    exportYearFiles(data: CalendarData, outputDir: string): Promise<void>;
    /**
     * Populate worksheet with year data
     */
    private populateWorksheet;
    /**
     * Populate worksheet with single month data
     */
    private populateMonthWorksheet;
    /**
     * Create summary sheet with statistics
     */
    private createSummarySheet;
    /**
     * Get month name from month number
     */
    private getMonthName;
    /**
     * Ensure directory exists, create if it doesn't
     */
    private ensureDirectoryExists;
}
/**
 * Utility function to export Excel data
 */
export declare function exportToExcel(data: CalendarData, outputPath: string, includeAllFields?: boolean): Promise<void>;
/**
 * Utility function to export individual year Excel files
 */
export declare function exportYearExcelFiles(data: CalendarData, outputDir: string): Promise<void>;
//# sourceMappingURL=excel.d.ts.map