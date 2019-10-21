import {Component, Input} from '@angular/core';
import {ColumnDescription} from '../../models/column-description';
import {Recipe} from '../../../crafting/models/recipe';

@Component({
  selector: 'wah-column',
  templateUrl: './column.component.html'
})
export class ColumnComponent {
  @Input() id: any;
  @Input() iconSize: number;
  @Input() isCrafting: boolean;
  @Input() showOwner: boolean;
  @Input() column: ColumnDescription;
  @Input() row: any;
  @Input() hideCraftingDetails: boolean;
  @Input() useAuctionItemForName: boolean;
  @Input() linkType: string;

  getSource(recipe: Recipe): string {
    return recipe.profession ? recipe.profession : 'On use';
  }
}
