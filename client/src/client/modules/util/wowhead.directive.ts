import {Directive, HostListener, Input} from '@angular/core';
import {AuctionItem} from '../auction/models/auction-item.model';
import {Auction, ColumnDescription, Item, Pet} from '@shared/models';
import {RealmService} from '../../services/realm.service';
import {TableUtil} from '../table/utils/table.util';
import {SharedService} from '../../services/shared.service';
import {Recipe} from '../crafting/models/recipe';
import {TooltipService} from '../core/services/tooltip.service';

@Directive({
  selector: '[wahItemTooltip]'
})
export class WowheadDirective {
  @Input() item: AuctionItem | Item | Auction | Pet | Recipe;
  @Input() column: ColumnDescription;
  @Input() idName = 'id';
  @Input() extra: string;
  @Input() linkType = 'item';
  private creatureId: any;

  constructor(
    private service: TooltipService,
    private realmService: RealmService
  ) {
  }

  private getColumnLinkType() {
    return this.column && this.column.options && this.column.options.tooltipType || this.linkType;
  }

  private setCreatureId() {
    const auc = (this.item as AuctionItem);
    if (auc.petSpeciesId && SharedService.pets[auc.petSpeciesId]) {
      this.creatureId = SharedService.pets[auc.petSpeciesId].creatureId;
    }
  }

  /**
   * Gets a string of the relevant relations for an item
   *
   * @param {*} item
   * @param column
   * @returns {string}
   * @memberof DataTableComponent
   */
  getWHRelations(): { id: number, type: string } {
    let type = this.getColumnLinkType() || 'item', id;
    if ((this.item as AuctionItem).petSpeciesId || (this.item as any).speciesId) {
      type = 'npc';
      id = ((this.item as any).creatureId ? (this.item as any).creatureId : this.creatureId);
    } else if ((this.item as Recipe).spellId && (type === 'recipe' || (this.item as Recipe).craftedItemId  <= 0)) {
      id = (this.item as Recipe).spellId;
      type = 'spell';
    } else {
      id = TableUtil.getItemID(this.item, this.column, this.idName);
    }

    return {
      id,
      type,
    };
  }

  @HostListener('mouseleave', ['$event']) clearTip() {
    this.service.clearTooltip();
  }

  @HostListener('mouseenter', ['$event']) getTooltip(event: MouseEvent) {
    const {
      id,
      type
    } = this.getWHRelations();

    let bonusIds;
    if ((this.item as AuctionItem)) {

      if ((this.item as AuctionItem).bonusIds) {
        bonusIds = (this.item as AuctionItem).bonusIds;
      }
    }

    if (id) {
      this.service.get(type, id, bonusIds, this.realmService.isClassic, event, this.item, this.extra)
        .catch(console.error);
    }
  }
}