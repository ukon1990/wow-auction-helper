import { Component, OnInit } from '@angular/core';
import { Watchlist, WatchlistItem } from '../../models/watchlist/watchlist';
import { SharedService } from '../../services/shared.service';
import { Recipe } from '../../models/crafting/recipe';

@Component({
  selector: 'wah-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.scss']
})
export class WatchlistComponent implements OnInit {
  test1Item = new WatchlistItem();
  test2Item = new WatchlistItem();
  constructor() {
    this.test1Item.itemID = 128541;
    this.test1Item.name = 'Enchant Ring - Binding of Critical ';
    this.test1Item.compareTo = this.getWatchlist().COMPARABLE_VARIABLES.BUYOUT;
    this.test1Item.target = 10;
    this.test1Item.targetType = this.getWatchlist().TARGET_TYPES.PERCENT;
    this.test1Item.criteria = this.getWatchlist().CRITERIAS.BELOW;
    this.test1Item.value = 0;


    this.test2Item.itemID = 127842;
    this.test2Item.name = 'Infernal Alchemist Stone';
    this.test2Item.compareTo = this.getWatchlist().COMPARABLE_VARIABLES.BUYOUT;
    this.test2Item.target = 10;
    this.test2Item.targetType = this.getWatchlist().TARGET_TYPES.GOLD;
    this.test2Item.criteria = this.getWatchlist().CRITERIAS.BELOW;
    this.test2Item.value = 0;
  }

  ngOnInit() {
    this.getWatchlist().addGroup('Test1');
    this.getWatchlist().addGroup('Test2');

    for (let i = 0; i < 10; i++) {
      this.getWatchlist().addItem(this.getWatchlist().groupsMap['Test1'], this.test1Item);
      this.getWatchlist().addItem(this.getWatchlist().groupsMap['Test2'], this.test2Item);
    }
  }

  /* istanbul ignore next */
  getWatchlist(): Watchlist {
    return SharedService.user.watchlist;
  }
}
