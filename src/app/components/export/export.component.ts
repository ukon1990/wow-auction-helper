import { Component, OnInit, Input } from '@angular/core';
import { FileService } from '../../services/file.service';

@Component({
	selector: 'app-export',
	templateUrl: './export.component.html'
})
export class ExportComponent {
	@Input() list;

	constructor(private fileService: FileService) {
	}

	export(): void {
		this.fileService.download('auctions', this.list, this.fileService.FILETYPES.EXCEL);
	}

}
