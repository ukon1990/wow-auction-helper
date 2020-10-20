import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {AuctionItem} from '../../../auction/models/auction-item.model';
import {Theme} from '../../../core/models/theme.model';
import {ThemeUtil} from '../../../core/utils/theme.util';
import {GameBuild} from '../../../../utils/game-build.util';
import {Item} from '../../../../models/item/item';
import {SharedService} from '../../../../services/shared.service';
import {Report} from '../../../../utils/report.util';
import {ItemLocale} from '../../../../language/item.locale';

@Component({
  selector: 'wah-auction-item-details',
  templateUrl: './auction-item-details.component.html',
  styleUrls: ['./auction-item-details.component.scss']
})
export class AuctionItemDetailsComponent implements OnChanges {
  @Input() item: AuctionItem;
  @Input() baseItem: Item;
  @Input() dialogId: string;
  theme: Theme = ThemeUtil.current;
  expansions = GameBuild.expansionMap;
  qualityLocale = ItemLocale.getQualities();
  bonuses: string;

  ngOnChanges({item}: SimpleChanges): void {
    if (item && item.currentValue) {
      // TODO: Fetch every version of this item
      this.setBonus(item.currentValue);
    }
  }

  isMobile(): boolean {
    return window.matchMedia('(max-width: 767px)').matches;
  }

  setBonus(item: AuctionItem = this.item): void {
    if (item.bonusIds) {
      const list = [];
      item.bonusIds.forEach(id => {
        const bonus = SharedService.bonusIdMap[id];
        if (!bonus) {
          list.push(`id=${id}`);
        } else {
          if (bonus.level) {
            list.push(`+${bonus.level} iLvL`);
          }
          if (bonus.quality) {
            list.push(this.qualityLocale.map.get(bonus.quality).name);
          }

          if (bonus.stats) {
            list.push(`${bonus.name} (${bonus.stats})`);
          }

          if (bonus.tag) {
            list.push(bonus.tag);
          }
        }
        Report.debug('setBonus', {
          id,
          bonus, list
        });
        this.bonuses = list.join(', ');
      });
    } else {
      this.bonuses = undefined;
    }
  }
}
