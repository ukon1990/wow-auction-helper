import {Directive, ElementRef, HostListener, Input} from '@angular/core';
import {ItemService} from '../../services/item.service';
import {AuctionItem} from '../auction/models/auction-item.model';
import {Item} from '../../models/item/item';
import {Auction} from '../auction/models/auction.model';
import {Pet} from '../pet/models/pet';
import {RealmService} from '../../services/realm.service';
import {TableUtil} from '../table/utils/table.util';
import {ColumnDescription} from '../table/models/column-description';
import {SharedService} from '../../services/shared.service';
import {Recipe} from '../crafting/models/recipe';

@Directive({
  selector: '[wahItemTooltip]'
})
export class WowheadDirective {
  @Input() item: AuctionItem | Item | Auction | Pet | Recipe;
  @Input() column: ColumnDescription;
  @Input() idName = 'id';
  @Input() extra: string;
  @Input() linkType = 'item';
  tooltip: Element;
  private creatureId: any;

  constructor(
    private service: ItemService,
    private realmService: RealmService,
    private element: ElementRef
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
    } else if ((this.item as Recipe).spellId && type === 'recipe') {
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

  @HostListener('mouseenter') getTooltip() {
    if (this.tooltip) {
      return;
    }
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
      const isClassic = this.realmService.isClassic;
      const locale = (localStorage.getItem('locale') || 'en').split('_')[0];
      this.service.getTooltip(type, id, bonusIds)
        .then((tooltip) => {
          const nativeElement = (this.element.nativeElement as Element);
          nativeElement.innerHTML = `
            <div class="item-name">
              ${nativeElement.innerHTML}
              <div class="wah-tooltip wowhead-tooltip mat-elevation-z10">
                ${tooltip}
                <div class="tooltip-extra">
                  ${this.extra || ''}
                  <br>

                  <small>
                    Click on the item name for more details.
                  </small>
                  <br>
                  <small>
                   Tooltip by: <a
                     target="_blank"
                     href="https://${locale}.${isClassic ? 'tbc' : ''}.wowhead.com/item/${id}"
                   >
                   WowHead
                   </a>.
                  </small>
                </div>
              </div>
            </div>
          `;
          this.tooltip = tooltip;
        })
        .catch(console.error);
    }
  }
}
