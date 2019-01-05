import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {Item} from '../../../models/item/item';
import {SharedService} from '../../../services/shared.service';
import {AuctionItem} from '../../../models/auction/auction-item';
import {itemClasses} from '../../../models/item/item-classes';
import {SummaryCard} from '../../../models/summary-card.model';
import {ChartData} from '../../../models/chart-data.model';
import {Recipe} from '../../../models/crafting/recipe';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'wah-ah-summary',
  templateUrl: './ah-summary.component.html',
  styleUrls: ['./ah-summary.component.scss']
})
export class AhSummaryComponent implements OnInit, OnDestroy {
  ahEvents: Subscription;
  summaries: SummaryCard[] = [
    this.expansionSummary(),
    this.itemByClassSummary(),
    this.getProfessionItemCount()
  ];

  private getProfessionItemCount() {
    return new SummaryCard(
      'Item count per profession',
      'line',
      [
        'Blacksmithing',
        'Leatherworking',
        'Alchemy',
        'Cooking',
        'Mining',
        'Tailoring',
        'Engineering',
        'Enchanting',
        'Jewelcrafting',
        'Inscription',
        'none'
      ].map(name => new ChartData(name, name)),
      []);
  }

  private itemByClassSummary() {
    return new SummaryCard(
      'Items by class',
      'pie',
      itemClasses.classes.map(c =>
        new ChartData(c.class, c.name)),
      []);
  }

  private expansionSummary() {
    return new SummaryCard(
      'Items by expansion',
      'bar',
      [
        new ChartData(0, 'Classic'),
        new ChartData(1, 'TBC'),
        new ChartData(2, 'WOTLK'),
        new ChartData(3, 'Cata'),
        new ChartData(4, 'MOP'),
        new ChartData(5, 'WOD'),
        new ChartData(6, 'Legion'),
        new ChartData(7, 'BFA')
      ],
      []);
  }

  /**
   * Potential interesting data:
   * - How many sellers
   * - How many unique items
   * - How many per item class and sub class
   * - Lowest dropchance items at AH?
   * - Expansions
   */

  constructor(private title: Title) {
    this.title.setTitle('WAH - Summary dashboard');
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
      s.clearEntries());

    SharedService.auctionItems.forEach((item: AuctionItem) => {
      this.addByExpansion(item);

      this.itemsByClass(item);

      this.addCrafts(item);
    });
  }

  getItem(item: AuctionItem): Item {
    return SharedService.items[item.itemID] ?
      SharedService.items[item.itemID] : new Item();
  }

  private addByExpansion(item: AuctionItem) {
    (this.summaries[0] as SummaryCard)
      .addEntry(this.getItem(item).expansionId, 1);
  }

  private itemsByClass(item: AuctionItem) {
    (this.summaries[1] as SummaryCard)
      .addEntry(this.getItem(item).itemClass, item.quantityTotal);
  }

  private addCrafts(item: AuctionItem) {
    const recipe: Recipe[] = SharedService.itemRecipeMap[item.itemID];
    if (recipe) {
      (this.summaries[2] as SummaryCard)
        .addEntry(recipe[0].profession, item.quantityTotal);
    }
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
