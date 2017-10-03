import { Injectable } from '@angular/core';
// https://www.npmjs.com/package/file-saver
import * as FileSaver from 'file-saver';
// https://www.npmjs.com/package/xlsx
import * as XLSX from 'xlsx';

@Injectable()
export class FileService {

	public readonly FILETYPES = {
		EXCEL: {
			extension: 'xlsx',
			type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
		}, TSV: {
			extension: 'tsv',
			type: 'application/tsv;charset=UTF-8'
		}, JSON: {
			extension: 'json',
			type: 'application/json;charset=UTF-8'
		}
};

	constructor() { }

	download(filename: string, data: Object[], filetype: Object): void {
		console.log(filename, data, filetype);
		if (filetype === this.FILETYPES.EXCEL) {
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
			this.generateFile(buffer, filename, filetype);
		}
	}

	private generateFile(buffer: Uint8Array, filename: string, filetype: Object): void {
		const dato = new Date();
		const data: Blob = new Blob([buffer], {
			type: filetype['type']
		});
		FileSaver.saveAs(
			data,
			`${
				filename
			}_eksportert_${
				dato.toLocaleDateString()
			}_${
				dato.toLocaleTimeString()
			}.${
				filetype['extension']
			}`);
	}
}
