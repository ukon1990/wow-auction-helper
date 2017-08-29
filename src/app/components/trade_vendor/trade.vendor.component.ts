import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { PageEvent } from '@angular/material';
import { ParentAuctionComponent } from '../auctions/parent.auctions.component';
import { lists } from '../../utils/globals';

declare const ga: Function;
@Component({
	selector: 'trade-vendor',
	templateUrl: 'trade.vendor.component.html',
	styleUrls: ['../auctions/auctions.component.css']
})
export class TradeVendorComponent extends ParentAuctionComponent implements OnInit {
	vendors = [{
		'itemID': 124124,
		'name': 'Blood of Sargeras',
		'materials': [{
			'itemID': 142117,
			'quantity': 10,
			'value': 0,
			'estDemand': 0,
			'regionSaleAvg': 0,
			'mktPrice': 0,
			'avgSold': 0,
			'buyout': 0
		}, {
			'itemID': 124118,
			'quantity': 10,
			'value': 0,
			'estDemand': 0,
			'regionSaleAvg': 0,
			'mktPrice': 0,
			'avgSold': 0,
			'buyout': 0
		}, {
			'itemID': 124119,
			'quantity': 10,
			'value': 0,
			'estDemand': 0,
			'regionSaleAvg': 0,
			'mktPrice': 0,
			'avgSold': 0,
			'buyout': 0
		}, {
			'itemID': 124120,
			'quantity': 10,
			'value': 0,
			'estDemand': 0,
			'regionSaleAvg': 0,
			'mktPrice': 0,
			'avgSold': 0,
			'buyout': 0
		}, {
			'itemID': 124121,
			'quantity': 10,
			'value': 0,
			'estDemand': 0,
			'regionSaleAvg': 0,
			'mktPrice': 0,
			'avgSold': 0,
			'buyout': 0
		}, {
			'itemID': 124107,
			'quantity': 10,
			'value': 0,
			'estDemand': 0,
			'regionSaleAvg': 0,
			'mktPrice': 0,
			'avgSold': 0,
			'buyout': 0
		}, {
			'itemID': 124108,
			'quantity': 10,
			'value': 0,
			'estDemand': 0,
			'regionSaleAvg': 0,
			'mktPrice': 0,
			'avgSold': 0,
			'buyout': 0
		}, {
			'itemID': 124109,
			'quantity': 10,
			'value': 0,
			'estDemand': 0,
			'regionSaleAvg': 0,
			'mktPrice': 0,
			'avgSold': 0,
			'buyout': 0
		}, {
			'itemID': 124110,
			'quantity': 10,
			'value': 0,
			'estDemand': 0,
			'regionSaleAvg': 0,
			'mktPrice': 0,
			'avgSold': 0,
			'buyout': 0
		}, {
			'itemID': 124111,
			'quantity': 10,
			'value': 0,
			'estDemand': 0,
			'regionSaleAvg': 0,
			'mktPrice': 0,
			'avgSold': 0,
			'buyout': 0
		}, {
			'itemID': 124112,
			'quantity': 10,
			'value': 0,
			'estDemand': 0,
			'regionSaleAvg': 0,
			'mktPrice': 0,
			'avgSold': 0,
			'buyout': 0
		}, {
			'itemID': 124101,
			'quantity': 10,
			'value': 0,
			'estDemand': 0,
			'regionSaleAvg': 0,
			'mktPrice': 0,
			'avgSold': 0,
			'buyout': 0
		}, {
			'itemID': 124102,
			'quantity': 10,
			'value': 0,
			'estDemand': 0,
			'regionSaleAvg': 0,
			'mktPrice': 0,
			'avgSold': 0,
			'buyout': 0
		}, {
			'itemID': 124103,
			'quantity': 10,
			'value': 0,
			'estDemand': 0,
			'regionSaleAvg': 0,
			'mktPrice': 0,
			'avgSold': 0,
			'buyout': 0
		}, {
			'itemID': 124104,
			'quantity': 10,
			'value': 0,
			'estDemand': 0,
			'regionSaleAvg': 0,
			'mktPrice': 0,
			'avgSold': 0,
			'buyout': 0
		}, {
			'itemID': 124105,
			'quantity': 3,
			'value': 0,
			'estDemand': 0,
			'regionSaleAvg': 0,
			'mktPrice': 0,
			'avgSold': 0,
			'buyout': 0
		}, {
			'itemID': 123918,
			'quantity': 10,
			'value': 0,
			'estDemand': 0,
			'regionSaleAvg': 0,
			'mktPrice': 0,
			'avgSold': 0,
			'buyout': 0
		}, {
			'itemID': 123919,
			'quantity': 5,
			'value': 0,
			'estDemand': 0,
			'regionSaleAvg': 0,
			'mktPrice': 0,
			'avgSold': 0,
			'buyout': 0
		}, {
			'itemID': 124113,
			'quantity': 10,
			'value': 0,
			'estDemand': 0,
			'regionSaleAvg': 0,
			'mktPrice': 0,
			'avgSold': 0,
			'buyout': 0
		}, {
			'itemID': 124115,
			'quantity': 10,
			'value': 0,
			'estDemand': 0,
			'regionSaleAvg': 0,
			'mktPrice': 0,
			'avgSold': 0,
			'buyout': 0
		}, {
			'itemID': 124438,
			'quantity': 10,
			'value': 0,
			'estDemand': 0,
			'regionSaleAvg': 0,
			'mktPrice': 0,
			'avgSold': 0,
			'buyout': 0
		}, {
			'itemID': 124439,
			'quantity': 10,
			'value': 0,
			'estDemand': 0,
			'regionSaleAvg': 0,
			'mktPrice': 0,
			'avgSold': 0,
			'buyout': 0
		}, {
			'itemID': 124437,
			'quantity': 10,
			'value': 0,
			'estDemand': 0,
			'regionSaleAvg': 0,
			'mktPrice': 0,
			'avgSold': 0,
			'buyout': 0
		}, {
			'itemID': 124440,
			'quantity': 10,
			'value': 0,
			'estDemand': 0,
			'regionSaleAvg': 0,
			'mktPrice': 0,
			'avgSold': 0,
			'buyout': 0
		}, {
			'itemID': 124441,
			'quantity': 3,
			'value': 0,
			'estDemand': 0,
			'regionSaleAvg': 0,
			'mktPrice': 0,
			'avgSold': 0,
			'buyout': 0
		}]
	}, {
		'itemID': 120945,
		'name': 'Primal spirit',
		'materials': [{
			'itemID': 113264,
			'quantity': 0.15,
			'value': 0,
			'estDemand': 0,
			'regionSaleAvg': 0,
			'mktPrice': 0,
			'avgSold': 0,
			'buyout': 0
		}, {
			'itemID': 113263,
			'quantity': 0.15,
			'value': 0,
			'estDemand': 0,
			'regionSaleAvg': 0,
			'mktPrice': 0,
			'avgSold': 0,
			'buyout': 0
		}, {
			'itemID': 113261,
			'quantity': 0.15,
			'value': 0,
			'estDemand': 0,
			'regionSaleAvg': 0,
			'mktPrice': 0,
			'avgSold': 0,
			'buyout': 0
		}, {
			'itemID': 113262,
			'quantity': 0.15,
			'value': 0,
			'estDemand': 0,
			'regionSaleAvg': 0,
			'mktPrice': 0,
			'avgSold': 0,
			'buyout': 0
		}, {
			'itemID': 118472,
			'quantity': 0.25,
			'value': 0,
			'estDemand': 0,
			'regionSaleAvg': 0,
			'mktPrice': 0,
			'avgSold': 0,
			'buyout': 0
		}, {
			'itemID': 127759,
			'quantity': 0.25,
			'value': 0,
			'estDemand': 0,
			'regionSaleAvg': 0,
			'mktPrice': 0,
			'avgSold': 0,
			'buyout': 0
		}, {
			'itemID': 108996,
			'quantity': 0.05,
			'value': 0,
			'estDemand': 0,
			'regionSaleAvg': 0,
			'mktPrice': 0,
			'avgSold': 0,
			'buyout': 0
		}]
	}
	];

	vendorIndex = 0;

	constructor(private titleService: Title) {
		super();
		this.titleService.setTitle('Wah - Trade vendor');
	}

	ngOnInit(): void {
		if (lists.auctions !== undefined && lists.auctions.length > 0) {
			this.setValues();
		} else {
			let refreshId = setInterval(() => {
				try {
					if (!lists.isDownloading && lists.auctions.length > 0) {
						this.setValues();
						clearInterval(refreshId);
					}
				} catch (e) { console.log(e); }
			}, 100);
		}
		this.selectVendor(0);
	}

	selectVendor(index: number) {
		this.vendorIndex = index;
		this.currentPage = 1;

		ga('send', {
			hitType: 'event',
			eventCategory: 'Trade vendor',
			eventAction: 'Selected vendor',
			eventLabel: `Selected the ${this.vendors[this.vendorIndex].name} vendor`
		});
	}

	setValues(): void {
		this.vendors.forEach(v => {
			v.materials.forEach(m => {
				m.value = lists.auctions[m.itemID] !== undefined ? lists.auctions[m.itemID].buyout * m.quantity : 0;
				m.buyout = lists.auctions[m.itemID] !== undefined ? lists.auctions[m.itemID].buyout : 0;
				if (this.apiToUse !== 'none') {
					m.estDemand = lists.auctions[m.itemID] !== undefined ? lists.auctions[m.itemID].estDemand : 0;
					m.regionSaleAvg = lists.auctions[m.itemID] !== undefined ? lists.auctions[m.itemID].regionSaleAvg : 0;
					m.mktPrice = lists.auctions[m.itemID] !== undefined ? lists.auctions[m.itemID].mktPrice : 0;
					m.avgSold = lists.auctions[m.itemID] !== undefined ? lists.auctions[m.itemID].avgDailySold : 0;
				}
			});
			v.materials.sort(function (a, b) {
				return b.value - a.value;
			});
		});
	}

	sortList() { }
}