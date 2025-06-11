import type { CalendarData, ExportConfig } from '../types.js';
/**
 * JSON exporter for calendar data
 */
export declare class JsonExporter {
    /**
     * Export calendar data to JSON format
     */
    export(data: CalendarData, config: ExportConfig): Promise<void>;
    /**
     * Export individual year files
     */
    exportYearFiles(data: CalendarData, outputDir: string): Promise<void>;
    /**
     * Simplify data by removing optional fields that are empty
     */
    private simplifyData;
    /**
     * Ensure directory exists, create if it doesn't
     */
    private ensureDirectoryExists;
}
/**
 * Utility function to export JSON data
 */
export declare function exportToJson(data: CalendarData, outputPath: string, includeAllFields?: boolean): Promise<void>;
/**
 * Utility function to export individual year JSON files
 */
export declare function exportYearJsonFiles(data: CalendarData, outputDir: string): Promise<void>;
//# sourceMappingURL=json.d.ts.map