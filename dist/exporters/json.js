import { promises as fs } from 'fs';
import { dirname } from 'path';
import { ScraperError, ScraperErrorType } from '../types.js';
/**
 * JSON exporter for calendar data
 */
export class JsonExporter {
    /**
     * Export calendar data to JSON format
     */
    async export(data, config) {
        try {
            // Ensure output directory exists
            await this.ensureDirectoryExists(config.outputPath);
            // Format data based on configuration
            const formattedData = config.includeAllFields
                ? data
                : this.simplifyData(data);
            // Write JSON file
            const jsonString = JSON.stringify(formattedData, null, 2);
            await fs.writeFile(config.outputPath, jsonString, 'utf8');
        }
        catch (error) {
            throw new ScraperError(ScraperErrorType.FILE_SYSTEM_ERROR, `Failed to export JSON to ${config.outputPath}`, error);
        }
    }
    /**
     * Export individual year files
     */
    async exportYearFiles(data, outputDir) {
        try {
            // Ensure output directory exists
            await this.ensureDirectoryExists(outputDir);
            // Export each year as a separate file
            for (const [year, yearData] of Object.entries(data)) {
                const yearFilePath = `${outputDir}/${year}.json`;
                const jsonString = JSON.stringify(yearData, null, 2);
                await fs.writeFile(yearFilePath, jsonString, 'utf8');
            }
        }
        catch (error) {
            throw new ScraperError(ScraperErrorType.FILE_SYSTEM_ERROR, `Failed to export year files to ${outputDir}`, error);
        }
    }
    /**
     * Simplify data by removing optional fields that are empty
     */
    simplifyData(data) {
        const simplified = {};
        for (const [year, yearData] of Object.entries(data)) {
            simplified[parseInt(year)] = yearData.map((month) => ({
                month: month.month,
                days: month.days.map((day) => {
                    const simplifiedDay = {
                        isHoliday: day.isHoliday,
                        day: day.day,
                        dayInEn: day.dayInEn,
                        en: day.en
                    };
                    // Only include tithi and event if they have meaningful values
                    if (day.tithi && day.tithi.trim() !== '' && day.tithi !== '--') {
                        simplifiedDay.tithi = day.tithi;
                    }
                    if (day.event && day.event.trim() !== '' && day.event !== '--') {
                        simplifiedDay.event = day.event;
                    }
                    return simplifiedDay;
                })
            }));
        }
        return simplified;
    }
    /**
     * Ensure directory exists, create if it doesn't
     */
    async ensureDirectoryExists(filePath) {
        const dir = dirname(filePath);
        try {
            await fs.access(dir);
        }
        catch {
            await fs.mkdir(dir, { recursive: true });
        }
    }
}
/**
 * Utility function to export JSON data
 */
export async function exportToJson(data, outputPath, includeAllFields = true) {
    const exporter = new JsonExporter();
    const config = {
        format: 'json',
        outputPath,
        includeAllFields
    };
    await exporter.export(data, config);
}
/**
 * Utility function to export individual year JSON files
 */
export async function exportYearJsonFiles(data, outputDir) {
    const exporter = new JsonExporter();
    await exporter.exportYearFiles(data, outputDir);
}
//# sourceMappingURL=json.js.map