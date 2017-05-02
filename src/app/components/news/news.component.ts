import { Component, OnInit, AfterViewInit } from '@angular/core';

declare var $;
@Component({
	selector: 'app-news',
	templateUrl: './news.component.html',
	styleUrls: ['./news.component.css']
})
export class NewsComponent implements AfterViewInit {

	constructor() { }

	ngAfterViewInit() {
		$(window).load(function() {
			$('#news-modal').modal('show');
		});
	}

}
