import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { WatchlistItem } from '../../../models/watchlist/watchlist';
import { Recipe } from '../../../models/crafting/recipe';
import { SharedService } from '../../../services/shared.service';
import { AuctionItem } from '../../../models/auction/auction-item';
import { MatCheckboxChange } from '@angular/material';
import { SelectionItem } from '../../../models/watchlist/selection-item.model';

@Component({
  selector: 'wah-watchlist-item',
  templateUrl: './watchlist-item.component.html',
  styleUrls: ['./watchlist-item.component.scss']
})
export class WatchlistItemComponent implements OnInit {
  @Input() item: WatchlistItem;
  @Input() selectionItem: SelectionItem = new SelectionItem();
  @Output() edit: EventEmitter<any> = new EventEmitter<any>();
  @Output() delete: EventEmitter<any> = new EventEmitter<any>();
  @Output() isSelected: EventEmitter<any> = new EventEmitter<any>();

  comparableVariables = SharedService.user.watchlist.COMPARABLE_VARIABLES_LIST;


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

  setSelection(change: MatCheckboxChange): void {
    this.isSelected.emit(change.checked);
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

    /* istanbul ignore next */
  setSelectedItem(item: any): void {
    SharedService.selectedItemId = item.itemID;
    SharedService.selectedSeller = undefined;
  }

  getAlertValueInGold(): number {
    return SharedService.user.watchlist.getTypeValueInGold(this.item);
  }
}
