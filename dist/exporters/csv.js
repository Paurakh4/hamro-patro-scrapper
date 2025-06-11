import { promises as fs } from 'fs';
import { dirname } from 'path';
import { createObjectCsvWriter } from 'csv-writer';
import { ScraperError, ScraperErrorType } from '../types.js';
/**
 * CSV exporter for calendar data
 */
export class CsvExporter {
    /**
     * Export calendar data to CSV format
     */
    async export(data, config) {
        try {
            // Ensure output directory exists
            await this.ensureDirectoryExists(config.outputPath);
            // Convert data to CSV rows
            const csvRows = this.convertToCSVRows(data, config.includeAllFields);
            // Define CSV headers
            const headers = [
                { id: 'year', title: 'Year' },
                { id: 'month', title: 'Month' },
                { id: 'day', title: 'Nepali Day' },
                { id: 'dayInEn', title: 'Day (English)' },
                { id: 'englishDate', title: 'English Date' },
                { id: 'isHoliday', title: 'Is Holiday' }
            ];
            if (config.includeAllFields) {
                headers.push({ id: 'tithi', title: 'Tithi' }, { id: 'event', title: 'Event' });
            }
            // Create CSV writer
            const csvWriter = createObjectCsvWriter({
                path: config.outputPath,
                header: headers
            });
            // Write CSV file
            await csvWriter.writeRecords(csvRows);
        }
        catch (error) {
            throw new ScraperError(ScraperErrorType.FILE_SYSTEM_ERROR, `Failed to export CSV to ${config.outputPath}`, error);
        }
    }
    /**
     * Export individual year CSV files
     */
    async exportYearFiles(data, outputDir) {
        try {
            // Ensure output directory exists
            await this.ensureDirectoryExists(outputDir);
            for (const [year, yearData] of Object.entries(data)) {
                const yearFilePath = `${outputDir}/${year}.csv`;
                const yearDataObj = { [year]: yearData };
                const csvRows = this.convertToCSVRows(yearDataObj, true);
                const headers = [
                    { id: 'year', title: 'Year' },
                    { id: 'month', title: 'Month' },
                    { id: 'day', title: 'Nepali Day' },
                    { id: 'dayInEn', title: 'Day (English)' },
                    { id: 'englishDate', title: 'English Date' },
                    { id: 'isHoliday', title: 'Is Holiday' },
                    { id: 'tithi', title: 'Tithi' },
                    { id: 'event', title: 'Event' }
                ];
                const csvWriter = createObjectCsvWriter({
                    path: yearFilePath,
                    header: headers
                });
                await csvWriter.writeRecords(csvRows);
            }
        }
        catch (error) {
            throw new ScraperError(ScraperErrorType.FILE_SYSTEM_ERROR, `Failed to export year CSV files to ${outputDir}`, error);
        }
    }
    /**
     * Convert calendar data to CSV rows
     */
    convertToCSVRows(data, includeAllFields) {
        const rows = [];
        for (const [yearStr, yearData] of Object.entries(data)) {
            const year = parseInt(yearStr);
            for (const monthData of yearData) {
                for (const day of monthData.days) {
                    const row = {
                        year,
                        month: monthData.month,
                        day: day.day,
                        dayInEn: day.dayInEn,
                        englishDate: day.en,
                        isHoliday: day.isHoliday
                    };
                    if (includeAllFields) {
                        row.tithi = day.tithi || '';
                        row.event = day.event || '';
                    }
                    rows.push(row);
                }
            }
        }
        return rows;
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
 * Utility function to export CSV data
 */
export async function exportToCSV(data, outputPath, includeAllFields = true) {
    const exporter = new CsvExporter();
    const config = {
        format: 'csv',
        outputPath,
        includeAllFields
    };
    await exporter.export(data, config);
}
/**
 * Utility function to export individual year CSV files
 */
export async function exportYearCSVFiles(data, outputDir) {
    const exporter = new CsvExporter();
    await exporter.exportYearFiles(data, outputDir);
}
//# sourceMappingURL=csv.js.map