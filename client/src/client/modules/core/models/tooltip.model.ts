import {Item} from '@shared/models';
import {Recipe} from '../../crafting/models/recipe';
import {AuctionItem} from '../../auction/models/auction-item.model';
import {SafeHtml} from '@angular/platform-browser';

export interface Tooltip {
  id: number;
  bonusIds?: number[];
  x: number;
  y: number;
  body: SafeHtml;
  type: string;
  data?: Item | Recipe | AuctionItem;
  extra?: SafeHtml;
}