import {AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges} from '@angular/core';
import {PageEvent} from '@angular/material/paginator';
import {FormControl} from '@angular/forms';
import {Report} from '../../../utils/report.util';
import {ColumnDescription} from '../models/column-description';
import {Sorter} from '../../../models/sorter';
import {SharedService} from '../../../services/shared.service';
import {User} from '../../../models/user/user';
import {Item} from '@shared/models';
import {ThemeUtil} from '../../core/utils/theme.util';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {TextUtil} from '@ukon1990/js-utilities';
import {RowClickEvent} from '../models/row-click-event.model';
import {ProfessionService} from '../../crafting/services/profession.service';
import {Profession} from '@shared/models/profession/profession.model';
import {faCartPlus, faExternalLinkSquareAlt, faEye, faTrashAlt} from '@fortawesome/free-solid-svg-icons';
import {AuctionsService} from '../../../services/auctions.service';
import {ItemLocale} from '../../../language/item.locale';
import {ShoppingCartService} from '../../shopping-cart/services/shopping-cart.service';

@Component({
  selector: 'wah-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements AfterViewInit, OnChanges, OnDestroy {

  @Input() id: any;
  @Input() iconSize: number;
  @Input() isCrafting: boolean;
  @Input() showOwner: boolean;
  @Input() columns: Array<ColumnDescription>;
  @Input() data: Array<any>;
  @Input() numOfRows: number;
  @Input() hideCraftingDetails: boolean;
  @Input() useAuctionItemForName: boolean;
  @Input() linkType: string;
  @Input() itemsPerPage = 10;
  @Input() maxVisibleRows: number;
  @Input() disableItemsPerPage: boolean;
  @Input() filterParameter: string;
  @Input() alwaysDisplayCart: boolean;

  @Output() rowClicked: EventEmitter<RowClickEvent<any>> = new EventEmitter();

  filteredData = [];
  sm = new SubscriptionManager();
  professionIdMap: Map<number, Profession> = new Map<number, Profession>();
  itemQualities = ItemLocale.getQualities().map;

  searchField: FormControl = new FormControl();
  pageRows: Array<number> = [10, 20, 40, 80, 100];
  pageEvent: PageEvent = {pageIndex: 0, pageSize: this.itemsPerPage, length: 0};
  sorter: Sorter;
  locale = (localStorage['locale'] || 'en_GB').split('-')[0];
  previousLength = 0;
  auctionDuration = {
    'VERY_LONG': '12h+',
    'LONG': '2-12h',
    'MEDIUM': '30m-2h',
    'SHORT': '<30m'
  };
  theme = ThemeUtil.current;
  faExternalLink = faExternalLinkSquareAlt;
  faEye = faEye;
  faTrashAlt = faTrashAlt;
  faCartPlus = faCartPlus;
  private isTyping: boolean;

  constructor(private professionService: ProfessionService,
              private auctionService: AuctionsService,
              private shoppingCartService: ShoppingCartService) {
    this.sorter = new Sorter(this.auctionService);

    this.sm.add(professionService.map, map => {
      this.professionIdMap = map;
    });
  }

  ngAfterViewInit() {
    if (this.numOfRows) {
      this.pageEvent.pageSize = this.numOfRows;
    }

    if (this.filterParameter) {
      this.sm.add(this.searchField.valueChanges,
        (value) => this.filterData(value));
    }
  }

  /* istanbul ignore next */
  ngOnChanges({data, itemsPerPage, filterParameter}: SimpleChanges) {
    if (data && data.currentValue) {
      // this.pageEvent.length = change.data.currentValue.length;
      if (this.previousLength !== data.currentValue.length) {
        this.pageEvent.pageIndex = 0;
      }

      this.handleDataChange([...data.currentValue],
        filterParameter ? filterParameter.currentValue : undefined);
    }

    if (itemsPerPage && itemsPerPage.currentValue) {
      this.pageEvent.pageSize = itemsPerPage.currentValue;
    }
  }

  private handleDataChange(data: any[], filterParameter: string) {
    this.previousLength = data.length;
    this.sorter.sort(data);

    if (this.filterParameter) {
      this.filterData(this.searchField.value, data, filterParameter);
    } else {
      this.filteredData = data;
    }
  }

  ngOnDestroy(): void {
    this.sm.unsubscribe();
  }

  filterData(value: any, data: any[] = this.data, filterParameter: string = this.filterParameter): void {
    if (!this.filterParameter || !data) {
      this.filteredData = data || [];
      return;
    }

    this.pageEvent.pageIndex = 0;
    this.filteredData = data.filter(d => {
      if (!d[filterParameter] && !SharedService.items[d.item]) {
        return false;
      }

      const compareName = d[this.filterParameter] ?
        d[filterParameter] : SharedService.items[d.item][this.filterParameter];
      return TextUtil.isEmpty(value) || TextUtil.contains(compareName, value);
    });
  }


  addEntryToCart(entry: any): void {
    if (entry.id && entry.reagents) {
      Report.send('Added recipe', 'Shopping cart');
      this.shoppingCartService.addRecipe(entry.id, 1);
    } else {
      // TODO: Add item -> SharedService.user.shoppingCart.add(entry);
      // Report.send('Added item', 'Shopping cart');
    }
  }

  /* istanbul ignore next */
  getFromValue(): number {
    if (!this.pageEvent || !this.pageEvent.pageSize) {
      return 0;
    }
    return (this.pageEvent.pageSize * (this.pageEvent.pageIndex + 1)) - this.pageEvent.pageSize;
  }

  /* istanbul ignore next */
  pageChange(event: PageEvent): void {
    this.pageEvent = event;
  }

  /* istanbul ignore next */
  getToValue(): number {
    if (!this.pageEvent || !this.pageEvent.pageSize) {
      return this.pageRows[0];
    }

    if (this.maxVisibleRows) {
      return this.maxVisibleRows;
    }

    return this.pageEvent.pageSize * (this.pageEvent.pageIndex + 1);
  }

  /* istanbul ignore next */
  getUser(): User {
    return SharedService.user;
  }

  /* istanbul ignore next */
  getItem(itemID: number): Item {
    return SharedService.items[itemID] ?
      SharedService.items[itemID] : new Item();
  }

  removeGroup(index: number): void {
    const pagignationIndex = this.pageEvent.pageIndex * this.pageEvent.pageSize;
    SharedService.user.watchlist.removeGroup(pagignationIndex + index);

    this.pageEvent.pageIndex = 0;
    Report.send('Removed group', 'Watchlist');
  }

  /* istanbul ignore next */
  isDarkMode(): boolean {
    return SharedService.user.isDarkMode;
  }

  sort(column: ColumnDescription): void {
    this.sorter.addKey(column.key, column.dataType === 'gold-per-item');
    this.sorter.sort(this.filteredData, column.customSort);
  }

  displayColumn(column: ColumnDescription): boolean {
    if (this.isMobile() && column.hideOnMobile) {
      return false;
    }
    return true;
  }

  isMobile(): boolean {
    return window.matchMedia('(max-width: 767px)').matches;
  }

  rowClickEvent(c: ColumnDescription, d: any): void {
    this.rowClicked.emit(new RowClickEvent(c, d));
  }


}