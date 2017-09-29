import { Injectable } from '@angular/core';
// https://www.npmjs.com/package/file-saver
import * as FileSaver from 'file-saver';
// https://www.npmjs.com/package/xlsx
import * as XLSX from 'xlsx';

@Injectable()
export class FileService {

	private readonly FILETYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
	private readonly EXTENSIONS = {EXCEL: '.xlsx', TSV: '.tsv'};

	constructor() { }

	download(filename: string, data: Object[], options?: Options): void {
		const worksheet: XLSX.WorkSheet = XLSX.utils
			.json_to_sheet(
				data),
			workbook: XLSX.WorkBook = {
				Sheets: {
					data: worksheet
				},
				SheetNames: ['data']
			},
			buffer: Uint8Array = XLSX.write(
				workbook,
				{ bookType: 'xlsx', type: 'buffer' });
		this.generateFile(buffer, filename);
	}

	private generateFile(buffer: Uint8Array, filename: string): void {
		const dato = new Date();
		const data: Blob = new Blob([buffer], {
			type: this.EXTENSIONS.EXCEL
		});
		FileSaver.saveAs(
			data,
			`${
				filename
			}_eksportert_${
				dato.toLocaleDateString()
			}_${
				dato.toLocaleTimeString()
			}${
				this.EXTENSIONS.EXCEL
			}`);
	}
}

class Options {
	extension?: string;
	columns?: string;
}
