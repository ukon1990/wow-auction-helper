import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { lists, db, copperToArray } from '../../utils/globals';
import dexie from 'dexie';

@Component({
	selector: 'app-watchlist',
	templateUrl: './watchlist.component.html',
	styleUrls: ['./watchlist.component.css']
})
export class WatchlistComponent implements OnInit {
	queryItems = [];
	filterForm: FormGroup;
	watchlist = [];

	constructor(private formBuilder: FormBuilder, private titleService: Title) {

		this.filterForm = formBuilder.group({
			'searchQuery': ''
		});
		this.titleService.setTitle('Wah - Watchlist');
	}

	ngOnInit() {
		this.searchDB();
	}

	searchDB() {
		console.log(this.filterForm.value['searchQuery']);
		db.table('items')
			.where('name')
			.startsWithIgnoreCase(this.filterForm.value['searchQuery'])
			.limit(5)
			.toArray()
			.then(i => {
				this.queryItems = i;
			}, e => {
				console.log(e);
			});
	}

	addToWatchlist(item) {
		const watch = {id: item.id, name: item.name, compareTo: 'buyout', belowValue: item.value};
		this.watchlist.push(watch);
		lists.watchlist[item.id] = watch;
	}

	getWatchlist() {
		return lists.watchlist;
	}

	copperToArray = copperToArray;
}
