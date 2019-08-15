import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {Title} from '@angular/platform-browser';
import {FormControl} from '@angular/forms';
import {SummaryCard} from '../../../../models/summary-card.model';
import {SharedService} from '../../../../services/shared.service';
import {ChartData} from '../../../../models/chart-data.model';
import {itemClasses} from '../../../../models/item/item-classes';
import {AuctionItem} from '../../../auction/models/auction-item.model';
import {SummaryUtil} from '../../../../utils/summary.util';
import {Recipe} from '../../../crafting/models/recipe';

@Component({
  selector: 'wah-ah-summary',
  templateUrl: './ah-summary.component.html',
  styleUrls: ['./ah-summary.component.scss']
})
export class AhSummaryComponent implements OnInit, OnDestroy {
  displayAs = new FormControl(false);
  ahEvents: Subscription;
  summaries: SummaryCard[] = [
    this.expansionSummary(),
    this.itemByClassSummary(),
    this.getProfessionItemCount(),
    new SummaryCard(
      'Recipes with at least 10% profit',
      'pie',
      [],
      []),
    new SummaryCard(
      'BFA Recipes with at least 10% profit',
      'pie',
      [],
      []),
    new SummaryCard(
      'Recipes with at least 10% profit and 10+ daily sold',
      'pie',
      [],
      []),

    new SummaryCard(
      'BFA Recipes with at least 10% profit and 10+ daily sold',
      'pie',
      [],
      [])
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

  summarizeData(): void {
    this.summaries.forEach(s =>
      s.clearEntries());

    SharedService.auctionItems.forEach((item: AuctionItem) => {
      this.addByExpansion(item);

      this.itemsByClass(item);

      this.addCrafts(item);
    });

    this.addProfitableCrafts(
      this.summaries[3],
      SummaryUtil.isProfitMatch,
      false);

    this.addProfitableCrafts
    (this.summaries[4],
      SummaryUtil.isProfitMatch,
      true);


    this.addProfitableCrafts
    (this.summaries[5],
      SummaryUtil.isProfitAndDailySoldMatch,
      false);


    this.addProfitableCrafts
    (this.summaries[6],
      SummaryUtil.isProfitAndDailySoldMatch,
      true);
  }

  private addByExpansion(item: AuctionItem) {
    (this.summaries[0] as SummaryCard)
      .addEntry(SummaryUtil.getItem(item.itemID).expansionId, 1);
  }

  private itemsByClass(item: AuctionItem) {
    (this.summaries[1] as SummaryCard)
      .addEntry(SummaryUtil.getItem(item.itemID).itemClass, item.quantityTotal);
  }

  private addCrafts(item: AuctionItem) {
    const recipe: Recipe[] = SharedService.itemRecipeMap[item.itemID];
    if (recipe) {
      (this.summaries[2] as SummaryCard)
        .addEntry(recipe[0].profession, item.quantityTotal);
    }
  }


  private addProfitableCrafts(summary: SummaryCard, filterFN: (n: Recipe) => boolean, onlyCurrentExpansion: boolean): void {
    const professions = {};

    SharedService.recipes.forEach((recipe: Recipe) => {
      if (filterFN(recipe) &&
        SummaryUtil.isCurrentExpansionMatch(recipe.itemID, onlyCurrentExpansion) &&
        SummaryUtil.isUnrakedOrRank3(recipe)) {
        const name = SummaryUtil.getProfessionNameFromRecipe(recipe);
        if (professions[name]) {
          professions[name]++;
        } else {
          professions[name] = 1;
        }
      }
    });
    Object.keys(professions)
      .forEach(name => {
        summary.labels.push(new ChartData(name, name));
        summary.addEntry(name, professions[name]);
      });
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
