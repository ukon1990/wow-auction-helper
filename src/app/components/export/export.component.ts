import { Component, OnInit, Input } from '@angular/core';
import { FileService } from '../../services/file.service';
import { db, lists } from '../../utils/globals';
import 'rxjs/add/operator/map';

declare const ga: Function;
@Component({
	selector: 'app-export',
	templateUrl: './export.component.html'
})
export class ExportComponent {
	@Input() list;
	@Input() auctionList: boolean;
	allAuctions: any[] = [];
	columns: any[] = [];

	constructor(private fileService: FileService) {
	}

	setColumnList(): void {
		const tmpCol = {};
		if (this.auctionList) {
			db.table('auctions').toArray().then(a => {
				a.forEach(i => {
					i['name'] = i['petSpeciesId'] ? lists.pets[i['petSpeciesId']].name : lists.items[i['item']].name;

					// Ohh such clean, but makes sure we get all possible columns used in dataset...
					Object.keys(i).forEach(k => {
						tmpCol[k] = [k];
					});
				});
				this.allAuctions = a;
				this.columns = Object.keys(tmpCol);
			});
		} else {
			this.columns = Object.keys(this.list[0]);
		}
	}

	removeColumn(index: number): void {
		this.columns.splice(index, 1);
	}

	export(): void {
		let tmpList = [], tmpObject = {};
		if (this.auctionList) {
			tmpList = this.allAuctions;
			ga('send', {
				hitType: 'event',
				eventCategory: 'Auctions',
				eventAction: 'Export',
				eventLabel: 'Exporting all auctions'
			});
		} else {
			tmpList.concat(this.list);
			ga('send', {
				hitType: 'event',
				eventCategory: 'Crafting',
				eventAction: 'Export',
				eventLabel: 'Exporting all crafts'
			});
		}
		this.fileService.download('auctions',
			tmpList.map( o => {
				tmpObject = {};
				Object.keys(o).forEach(k => {
					if (this.columns[k]) {
						tmpObject[k] = o[k];
					}
				});
				return tmpObject;
			}),
			this.fileService.FILETYPES.EXCEL);
	}

}
