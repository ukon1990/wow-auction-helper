import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {Item} from '../../../models/item/item';
import {SharedService} from '../../../services/shared.service';
import {AuctionItem} from '../../../models/auction/auction-item';
import {itemClasses} from '../../../models/item/item-classes';

@Component({
  selector: 'wah-ah-summary',
  templateUrl: './ah-summary.component.html',
  styleUrls: ['./ah-summary.component.scss']
})
export class AhSummaryComponent implements OnInit, OnDestroy {
  ahEvents: Subscription;
  summaries = [
    {
      title: 'Expansions',
      chartType: 'bar',
      labels: ['Classic', 'TBC', 'WOTLK', 'Cata', 'MOP', 'WOD', 'Legion', 'BFA'],
      data: [],
      table: {
        columns: [],
        data: []
      }
    }, {
      title: 'Item classes',
      chartType: 'bar',
      labels: ['Classic', 'TBC', 'WOTLK', 'Cata', 'MOP', 'WOD', 'Legion', 'BFA'],
      data: [],
      table: {
        columns: [],
        data: []
      }
    }
  ];

  /**
   * Potential interesting data:
   * - How many sellers
   * - How many unique items
   * - How many per item class and sub class
   * - Lowest dropchance items at AH?
   * - Expansions
   */

  constructor() {
  }

  ngOnInit() {
    this.ahEvents = SharedService.events.auctionUpdate
      .subscribe(() =>
        this.summarizeData());
    this.summarizeData();
  }

  ngOnDestroy(): void {
    this.ahEvents.unsubscribe();
  }

  summarizeData(): void {
    this.summaries.forEach(s =>
      s.data.length = 0);

    SharedService.auctionItems.forEach((item: AuctionItem) => {
      this.addByExpansion(item);

      this.itemsByClass(item);
    });
    console.log(this.summaries);
  }

  getItem(item: AuctionItem): Item {
    return SharedService.items[item.itemID] ?
      SharedService.items[item.itemID] : new Item();
  }

  private addByExpansion(item: AuctionItem) {
    const atIndex = this.summaries[0].data[this.getItem(item).expansionId];
    if (!atIndex) {
      this.summaries[0].data[this.getItem(item).expansionId] = 1;
    } else {
      this.summaries[0].data[this.getItem(item).expansionId]++;
    }
  }

  private itemsByClass(item: AuctionItem) {

  }

  setItemClassLabels(): void {
    itemClasses.classes.forEach(c => {
      c.subclasses.forEach(sc => {
        const id = `${c.class}-${sc.subclass}`;

        /**
         if (this.itemClassesMap[id]) {
          this.itemClassesMap[id].name = `${sc.name} - ${c.name}`;
          }
         */
      });
    });
  }
}
