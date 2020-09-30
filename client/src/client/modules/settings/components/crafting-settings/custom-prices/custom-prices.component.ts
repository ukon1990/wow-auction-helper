import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';

import {SharedService} from '../../../../../services/shared.service';
import {Item} from '../../../../../models/item/item';
import {CustomPrice, CustomPrices} from '../../../../crafting/models/custom-price';
import {ColumnDescription} from '../../../../table/models/column-description';
import {CraftingUtil} from '../../../../crafting/utils/crafting.util';
import {customPricesDefault} from '../../../../crafting/models/default-custom-prices';
import {Report} from '../../../../../utils/report.util';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {AuctionsService} from '../../../../../services/auctions.service';

@Component({
  selector: 'wah-custom-prices',
  templateUrl: './custom-prices.component.html',
  styleUrls: ['./custom-prices.component.scss']
})
export class CustomPricesComponent implements OnInit, OnDestroy {
  itemSearchForm: FormControl = new FormControl();
  filteredItems: Item[];
  columns: ColumnDescription[] = [
    {key: 'name', title: 'Name', dataType: 'name'},
    {key: 'price', title: 'Price', dataType: 'input-gold'},
    {key: '', title: 'Actions', dataType: 'action', actions: ['custom-price-delete']}
  ];
  @Input() itemID: number;
  sm = new SubscriptionManager();
  customPrices: CustomPrice[] = [];

  constructor(private auctionService: AuctionsService) {
    this.sm.add(this.itemSearchForm.valueChanges, (name) => this.filter(name));
    this.setCustomPrices();
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.sm.unsubscribe();
    CustomPrices.save();
    CraftingUtil.calculateCost(false, this.auctionService.mapped.value);
  }

  add(item: Item): void {
    CustomPrices.add(item);
    this.itemSearchForm.setValue('');
    this.setCustomPrices();

    Report.send('Added custom price', 'Custom price');
  }

  /**
   * Such efficient, such ugh
   * @param name Item name for the query
   */
  private filter(name: string): void {
    this.filteredItems = SharedService.itemsUnmapped.filter(i =>
      i.name.toLowerCase().indexOf(name.toLowerCase()) !== -1).slice(0, 20);
  }

  /* istanbul ignore next */
  isDarkmode(): boolean {
    return SharedService.user ? SharedService.user.isDarkMode : false;
  }

  resetToDefault(): void {
    SharedService.user.customPrices = customPricesDefault;
  }

  setCustomPrices() {
    this.customPrices = [...SharedService.user.customPrices];
  }
}
