import { Component, OnInit, AfterViewInit } from '@angular/core';

declare function require(moduleName: string): any;
const version = require('../../../../package.json').version;
declare var $;
@Component({
  selector: 'wah-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements AfterViewInit {
  showNews: boolean;

  constructor() {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      try {
        console.log(localStorage['timestamp_news'], version);
        if (localStorage['realm'] &&
            localStorage['timestamp_news'] && localStorage['timestamp_news'] !== version) {
            this.showNews = true;
        } else if (!localStorage['timestamp_news']) {
            this.close();
        }
      } catch (e) {
        console.log(e);
      }
    }, 1000);
  }

  close(): void {
    localStorage['timestamp_news'] = version;
    this.showNews = false;
  }
}
