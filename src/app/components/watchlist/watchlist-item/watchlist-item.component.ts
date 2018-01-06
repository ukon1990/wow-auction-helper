import { Component, OnInit, Input } from '@angular/core';
import { WatchlistItem } from '../../../models/watchlist/watchlist';
import { Recipe } from '../../../models/crafting/recipe';
import { SharedService } from '../../../services/shared.service';

@Component({
  selector: 'wah-watchlist-item',
  templateUrl: './watchlist-item.component.html',
  styleUrls: ['./watchlist-item.component.scss']
})
export class WatchlistItemComponent implements OnInit {
  @Input() item: WatchlistItem;
  constructor() { }

  ngOnInit() {
  }

  getRecipeName(recipe: Recipe): string {
    return `${recipe.name}${recipe.rank ? ' - ' + recipe.rank : ''}`;
  }
  /* istanbul ignore next */
  getRecipesForItem(itemID: any): Array<Recipe> {
    return SharedService.itemRecipeMap[itemID] ?
      SharedService.itemRecipeMap[itemID].reverse() : undefined;
  }
}
