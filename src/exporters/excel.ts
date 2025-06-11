import { promises as fs } from 'fs';
import { dirname } from 'path';
import ExcelJS from 'exceljs';
import type { CalendarData, ExportConfig } from '../types.js';
import { ScraperError, ScraperErrorType } from '../types.js';

/**
 * Excel exporter for calendar data
 */
export class ExcelExporter {
  /**
   * Export calendar data to Excel format
   */
  async export(data: CalendarData, config: ExportConfig): Promise<void> {
    try {
      // Ensure output directory exists
      await this.ensureDirectoryExists(config.outputPath);

      // Create workbook
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Hamro Patro Scrapper';
      workbook.created = new Date();

      // Create a worksheet for each year
      for (const [yearStr, yearData] of Object.entries(data)) {
        const year = parseInt(yearStr);
        const worksheet = workbook.addWorksheet(`Year ${year}`);
        
        await this.populateWorksheet(worksheet, year, yearData, config.includeAllFields);
      }

      // If only one year, also create a summary sheet
      if (Object.keys(data).length === 1) {
        const summarySheet = workbook.addWorksheet('Summary');
        await this.createSummarySheet(summarySheet, data, config.includeAllFields);
      }

      // Save the workbook
      await workbook.xlsx.writeFile(config.outputPath);

    } catch (error) {
      throw new ScraperError(
        ScraperErrorType.FILE_SYSTEM_ERROR,
        `Failed to export Excel to ${config.outputPath}`,
        error as Error
      );
    }
  }

  /**
   * Export individual year Excel files
   */
  async exportYearFiles(data: CalendarData, outputDir: string): Promise<void> {
    try {
      // Ensure output directory exists
      await this.ensureDirectoryExists(outputDir);

      for (const [yearStr, yearData] of Object.entries(data)) {
        const year = parseInt(yearStr);
        const yearFilePath = `${outputDir}/${year}.xlsx`;
        
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Hamro Patro Scrapper';
        workbook.created = new Date();

        // Create worksheets for each month
        for (const monthData of yearData) {
          const monthName = this.getMonthName(monthData.month);
          const worksheet = workbook.addWorksheet(`${monthName} ${year}`);
          
          await this.populateMonthWorksheet(worksheet, year, monthData, true);
        }

        // Create summary worksheet
        const summarySheet = workbook.addWorksheet('Year Summary');
        await this.populateWorksheet(summarySheet, year, yearData, true);

        await workbook.xlsx.writeFile(yearFilePath);
      }

    } catch (error) {
      throw new ScraperError(
        ScraperErrorType.FILE_SYSTEM_ERROR,
        `Failed to export year Excel files to ${outputDir}`,
        error as Error
      );
    }
  }

  /**
   * Populate worksheet with year data
   */
  private async populateWorksheet(
    worksheet: ExcelJS.Worksheet,
    _year: number,
    yearData: any[],
    includeAllFields: boolean
  ): Promise<void> {
    // Set up headers
    const headers = ['Year', 'Month', 'Nepali Day', 'Day (English)', 'English Date', 'Is Holiday'];
    
    if (includeAllFields) {
      headers.push('Tithi', 'Event');
    }

    worksheet.addRow(headers);

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Add data rows
    for (const monthData of yearData) {
      for (const day of monthData.days) {
        const row = [
          _year,
          monthData.month,
          day.day,
          day.dayInEn,
          day.en,
          day.isHoliday ? 'Yes' : 'No'
        ];

        if (includeAllFields) {
          row.push(day.tithi || '', day.event || '');
        }

        const addedRow = worksheet.addRow(row);
        
        // Highlight holidays
        if (day.isHoliday) {
          addedRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFCCCC' }
          };
        }
      }
    }

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = 15;
    });
  }

  /**
   * Populate worksheet with single month data
   */
  private async populateMonthWorksheet(
    worksheet: ExcelJS.Worksheet,
    _year: number,
    monthData: any,
    includeAllFields: boolean
  ): Promise<void> {
    // Set up headers
    const headers = ['Day', 'Nepali Day', 'English Date', 'Is Holiday'];
    
    if (includeAllFields) {
      headers.push('Tithi', 'Event');
    }

    worksheet.addRow(headers);

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Add data rows
    for (const day of monthData.days) {
      const row = [
        day.dayInEn,
        day.day,
        day.en,
        day.isHoliday ? 'Yes' : 'No'
      ];

      if (includeAllFields) {
        row.push(day.tithi || '', day.event || '');
      }

      const addedRow = worksheet.addRow(row);
      
      // Highlight holidays
      if (day.isHoliday) {
        addedRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFCCCC' }
        };
      }
    }

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = 15;
    });
  }

  /**
   * Create summary sheet with statistics
   */
  private async createSummarySheet(
    worksheet: ExcelJS.Worksheet,
    data: CalendarData,
    _includeAllFields: boolean
  ): Promise<void> {
    worksheet.addRow(['Hamro Patro Calendar Data Summary']);
    worksheet.addRow([]);

    for (const [yearStr, yearData] of Object.entries(data)) {
      const year = parseInt(yearStr);
      const totalDays = yearData.reduce((sum: number, month: any) => sum + month.days.length, 0);
      const totalHolidays = yearData.reduce(
        (sum: number, month: any) => sum + month.days.filter((day: any) => day.isHoliday).length,
        0
      );

      worksheet.addRow([`Year: ${year}`]);
      worksheet.addRow([`Total Days: ${totalDays}`]);
      worksheet.addRow([`Total Holidays: ${totalHolidays}`]);
      worksheet.addRow([`Working Days: ${totalDays - totalHolidays}`]);
      worksheet.addRow([]);
    }

    // Style the summary
    worksheet.getRow(1).font = { bold: true, size: 16 };
  }

  /**
   * Get month name from month number
   */
  private getMonthName(month: number): string {
    const monthNames = [
      'Baishakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin',
      'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
    ];
    return monthNames[month - 1] || `Month ${month}`;
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
 * Utility function to export Excel data
 */
export async function exportToExcel(
  data: CalendarData, 
  outputPath: string, 
  includeAllFields: boolean = true
): Promise<void> {
  const exporter = new ExcelExporter();
  const config: ExportConfig = {
    format: 'excel',
    outputPath,
    includeAllFields
  };
  
  await exporter.export(data, config);
}

/**
 * Utility function to export individual year Excel files
 */
export async function exportYearExcelFiles(
  data: CalendarData, 
  outputDir: string
): Promise<void> {
  const exporter = new ExcelExporter();
  await exporter.exportYearFiles(data, outputDir);
}
