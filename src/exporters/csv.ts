import { promises as fs } from 'fs';
import { dirname } from 'path';
import { createObjectCsvWriter } from 'csv-writer';
import type { CalendarData, ExportConfig } from '../types.js';
import { ScraperError, ScraperErrorType } from '../types.js';

/**
 * Interface for CSV row data
 */
interface CsvRow {
  year: number;
  month: number;
  day: string;
  dayInEn: string;
  englishDate: string;
  isHoliday: boolean;
  tithi?: string;
  event?: string;
}

/**
 * CSV exporter for calendar data
 */
export class CsvExporter {
  /**
   * Export calendar data to CSV format
   */
  async export(data: CalendarData, config: ExportConfig): Promise<void> {
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
        headers.push(
          { id: 'tithi', title: 'Tithi' },
          { id: 'event', title: 'Event' }
        );
      }

      // Create CSV writer
      const csvWriter = createObjectCsvWriter({
        path: config.outputPath,
        header: headers
      });

      // Write CSV file
      await csvWriter.writeRecords(csvRows);

    } catch (error) {
      throw new ScraperError(
        ScraperErrorType.FILE_SYSTEM_ERROR,
        `Failed to export CSV to ${config.outputPath}`,
        error as Error
      );
    }
  }

  /**
   * Export individual year CSV files
   */
  async exportYearFiles(data: CalendarData, outputDir: string): Promise<void> {
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

    } catch (error) {
      throw new ScraperError(
        ScraperErrorType.FILE_SYSTEM_ERROR,
        `Failed to export year CSV files to ${outputDir}`,
        error as Error
      );
    }
  }

  /**
   * Convert calendar data to CSV rows
   */
  private convertToCSVRows(data: CalendarData, includeAllFields: boolean): CsvRow[] {
    const rows: CsvRow[] = [];

    for (const [yearStr, yearData] of Object.entries(data)) {
      const year = parseInt(yearStr);
      
      for (const monthData of yearData) {
        for (const day of monthData.days) {
          const row: CsvRow = {
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
  private async ensureDirectoryExists(filePath: string): Promise<void> {
    const dir = dirname(filePath);
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }
}

/**
 * Utility function to export CSV data
 */
export async function exportToCSV(
  data: CalendarData, 
  outputPath: string, 
  includeAllFields: boolean = true
): Promise<void> {
  const exporter = new CsvExporter();
  const config: ExportConfig = {
    format: 'csv',
    outputPath,
    includeAllFields
  };
  
  await exporter.export(data, config);
}

/**
 * Utility function to export individual year CSV files
 */
export async function exportYearCSVFiles(
  data: CalendarData, 
  outputDir: string
): Promise<void> {
  const exporter = new CsvExporter();
  await exporter.exportYearFiles(data, outputDir);
}
