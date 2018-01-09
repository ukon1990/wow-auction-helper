import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { WatchlistItem } from '../../../models/watchlist/watchlist';
import { Recipe } from '../../../models/crafting/recipe';
import { SharedService } from '../../../services/shared.service';
import { AuctionItem } from '../../../models/auction/auction-item';

@Component({
  selector: 'wah-watchlist-item',
  templateUrl: './watchlist-item.component.html',
  styleUrls: ['./watchlist-item.component.scss']
})
export class WatchlistItemComponent implements OnInit {
  @Input() item: WatchlistItem;
  @Output() edit: EventEmitter<any> = new EventEmitter<any>();
  @Output() delete: EventEmitter<any> = new EventEmitter<any>();


  constructor() { }

  ngOnInit() {
  }

  isTargetMatch(item: WatchlistItem): boolean {
    return SharedService.user.watchlist.isTargetMatch(item);
  }

  getAuctionItem(itemID: number): AuctionItem {
    return SharedService.auctionItemsMap[itemID] ?
    SharedService.auctionItemsMap[itemID] : new AuctionItem();
  }

  /* istanbul ignore next */
  getRecipeName(recipe: Recipe): string {
    return `${recipe.name}${recipe.rank ? ' - ' + recipe.rank : ''}`;
  }
  /* istanbul ignore next */
  getRecipesForItem(itemID: any): Array<Recipe> {
    return SharedService.itemRecipeMap[itemID] ?
      SharedService.itemRecipeMap[itemID].reverse() : undefined;
  }
}