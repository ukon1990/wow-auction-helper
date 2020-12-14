import {Component, OnDestroy, OnInit} from '@angular/core';
import {ProspectingAndMillingUtil} from '../../../../utils/prospect-milling.util';
import {ColumnDescription} from '../../../table/models/column-description';
import {Remains} from '../../../../models/item/remains.model';
import {SharedService} from '../../../../services/shared.service';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {Filters} from '../../../../utils/filtering';
import {EmptyUtil} from '@ukon1990/js-utilities';
import {Item} from '../../../../models/item/item';
import {AuctionItem} from '../../../auction/models/auction-item.model';
import {AuctionsService} from '../../../../services/auctions.service';


@Component({
  selector: 'wah-milling',
  templateUrl: './milling.component.html',
  styleUrls: ['./milling.component.scss']
})
export class MillingComponent implements OnInit, OnDestroy {
  locale = localStorage['locale'].split('-')[0];
  columns: ColumnDescription[] = [
    {key: 'name', title: 'Name', dataType: 'name'},
    {key: 'cost', title: 'Cost', dataType: 'gold'},
    {key: 'value', title: 'Value', dataType: 'gold'},
    {key: 'dropChance', title: 'Drop chance', dataType: 'percent'}
  ];
  types = ProspectingAndMillingUtil.TYPES;
  milling: Remains[] = [];
  prospecting: Remains[] = [];
  isEditing: boolean;
  isEditingType;
  editingType = {
    MILLING: 'MILLING',
    PROSPECTING: 'PROSPECTING'
  };
  form: FormGroup;
  data = {
    milling: ProspectingAndMillingUtil.mills,
    prospecting: ProspectingAndMillingUtil.prospecting
  };
  sm = new SubscriptionManager();

  constructor(private fb: FormBuilder, private auctionService: AuctionsService) {
    const filter = JSON.parse(localStorage.getItem('query_destroy')) || undefined;
    this.form = fb.group({
      minROI: filter && filter.minROI ? filter.minROI : null,
      type: new FormControl(0)
    });
  }

  ngOnInit() {
    this.sm.add(this.form.valueChanges, ({minROI, type}) => {
      localStorage['query_destroy'] = JSON.stringify(this.form.value);
      this.filterData(minROI, type);
    });

    /* TODO: When I've got time and remember to do it
    if (Filters.isUsingAPI()) {
      this.columns.push({key: 'saleRate', title: 'Sale rate', dataType: 'percent'});
      this.sm.add(SharedService.events.auctionUpdate, () => {
        ProspectingAndMillingUtil.mills = ProspectingAndMillingUtil.mills.map(m => {
          const item: AuctionItem = SharedService.auctionItemsMap[m.id];
          console.log(m, item);
          return {
            saleRate: item && item.regionSaleAvg ? item.regionSaleRate : 0,
            ...m
          };
        });
        const {minROI, type} = this.form.value;
        this.filterData(minROI, type);
      });
    }*/
    this.sm.add(this.auctionService.mapped, () => {
      const {minROI, type} = this.form.value;
      ProspectingAndMillingUtil.calculateCost();
      this.filterData(minROI, type);
    });
  }

  private filterData(minROI: number, type: number) {
    const isMinROISet = !EmptyUtil.isNullOrUndefined(minROI);
    if (isMinROISet) {
      minROI = minROI * 10000;
    }
    this.data.milling = ProspectingAndMillingUtil.mills
      .filter(m => !isMinROISet || Filters.isXSmallerThanOrEqualToY(minROI, m.yield));
    this.data.prospecting = ProspectingAndMillingUtil.prospecting
      .filter(m => !isMinROISet || Filters.isXSmallerThanOrEqualToY(minROI, m.yield));
  }

  ngOnDestroy(): void {
    this.sm.unsubscribe();
  }

  openEditWindow(type: string): void {
    this.isEditing = true;
    this.isEditingType = type;
    console.log('type', type, this.isEditingType === this.editingType.MILLING);
  }

  closeEditWindow(): void {
    this.isEditing = false;
    this.isEditingType = undefined;
  }
}
