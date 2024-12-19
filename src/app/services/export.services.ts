// export.service.ts
import { Injectable, ElementRef } from '@angular/core';
import FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

const EXCEL_EXTENSION = '.xlsx';
const CSV_EXTENSION = '.csv';
const CSV_TYPE = 'text/csv;charset=utf-8;';

@Injectable({
    providedIn: 'root', // Optional for global availability
  })
export class ExportService {
  constructor() {}

  public exportTableElmToExcel(element: ElementRef, fileName: string): void {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element.nativeElement);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, ws, 'Sheet1');
    XLSX.writeFile(workbook, `${fileName}${EXCEL_EXTENSION}`);
  }

  public exportJsonToExcel(json: any[], fileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json[0].data, this.getOptions(json[0]));
    for (let i = 1; i < json.length; i++) {
      XLSX.utils.sheet_add_json(worksheet, [{}], this.getOptions({ data: [], skipHeader: true }, -1));
      XLSX.utils.sheet_add_json(worksheet, json[i].data, this.getOptions(json[i], -1));
    }
    const workbook: XLSX.WorkBook = { Sheets: { Sheet1: worksheet }, SheetNames: ['Sheet1'] };
    XLSX.writeFile(workbook, `${fileName}${EXCEL_EXTENSION}`);
  }

  private getOptions(json: any, origin?: number): any {
    const options = { skipHeader: json.skipHeader || false, header: json.header || [], origin: origin || -1 };
    return options;
  }

  public exportToCsv(rows: object[], fileName: string, columns?: string[]): string {
    if (!rows || !rows.length) return '';
    const separator = ',';
    const keys = Object.keys(rows[0]).filter(k => (columns?.length ? columns.includes(k) : true));
    const csvContent = keys.join(separator) + '\n' +
      rows.map((row: Record<string, any>) => keys.map(k => {
        let cell = row[k] === null || row[k] === undefined ? '' : row[k];
        cell = cell instanceof Date ? cell.toLocaleString() : cell.toString().replace(/"/g, '""');
        if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
        return cell;
      }).join(separator)).join('\n');
    this.saveAsFile(csvContent, `${fileName}${CSV_EXTENSION}`, CSV_TYPE);
    return csvContent; // Ensure there's a return statement at the end of the function
  }

  private saveAsFile(buffer: any, fileName: string, fileType: string): void {
    const data: Blob = new Blob([buffer], { type: fileType });
    FileSaver.saveAs(data, fileName);
  }
}
