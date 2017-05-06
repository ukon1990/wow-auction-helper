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
	copperToArray = copperToArray;
	queryItems = [];
	filterForm: FormGroup;
	watchlist = {recipes: [], items: []};

	constructor(private formBuilder: FormBuilder, private titleService: Title) {

		this.filterForm = formBuilder.group({
			'searchQuery': ''
		});
		this.titleService.setTitle('Wah - Watchlist');
	}

	ngOnInit() {
		this.searchDB();
		// this.watchlist = lists.watchlist;
	}

	searchDB() {
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

	addItemToWatchlist(item) {
		try {
			const watch = {id: item.id, name: item.name, compareTo: 'buyout', belowValue: item.value};
			this.watchlist.items.push(watch);
			lists.watchlist.items[item.id] = watch;
		} catch (error) {
			console.log('Add item to watchlist faild:', error);
		}
	}

	getItemWatchlist() {
		return lists.watchlist.items;
	}
}
