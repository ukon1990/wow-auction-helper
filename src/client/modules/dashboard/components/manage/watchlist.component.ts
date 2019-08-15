import {Component, AfterViewInit} from '@angular/core';
import {SharedService} from '../../../../services/shared.service';
import {Title} from '@angular/platform-browser';
import {Watchlist} from '../../models/watchlist.model';

@Component({
  selector: 'wah-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.scss']
})
export class WatchlistComponent implements AfterViewInit {
  selectedTabIndex = 2;
  watchlist: Watchlist;

  constructor() {
  }

  ngAfterViewInit() {
    if (!SharedService.user.watchlist) {
      SharedService.user.watchlist = new Watchlist();
    }
    this.watchlist = SharedService.user.watchlist;
  }
}
