import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {Recipe} from '../models/recipe';
import {GameBuild} from '@shared/utils';
import {ColumnDescription} from '@shared/models';
import {SharedService} from '../../../services/shared.service';
import {AuctionsService} from '../../../services/auctions.service';
import {ThemeUtil} from '../../core/utils/theme.util';
import {ProfessionService} from '../services/profession.service';
import {ItemClassService} from '../../item/service/item-class.service';
import {ItemClass} from '../../item/models/item-class.model';
import {SettingsService} from '../../user/services/settings/settings.service';
import {RealmService} from '../../../services/realm.service';
import {AuthService} from '../../user/services/auth.service';
import {ColumnTypeEnum} from '@shared/enum';
import {MatDialog} from '@angular/material/dialog';
import {RecipeDialogComponent} from '../../admin/components/recipe/recipe-dialog/recipe-dialog.component';
import {CraftingFormFilterModel} from '../models/crafting-form-filter.model';
import {CraftingFilterUtil} from '../utils/crafting-filter.util';
import {debounceTime} from 'rxjs';

@Component({
  selector: 'wah-crafting',
  templateUrl: './crafting.component.html',
  styleUrls: ['./crafting.component.scss']
})
export class CraftingComponent implements OnInit, OnDestroy {
  isClassic = false;
  theme = ThemeUtil.current;
  searchForm: UntypedFormGroup;
  filtered: Recipe[] = [];
  subs = new SubscriptionManager();
  itemClasses: ItemClass[] = ItemClassService.classes.value;
  professions = [];
  expansions = [];
  private lastCalculationTime: number;
  private craftingFilterUtil: CraftingFilterUtil;

  columns: ColumnDescription[] = [
    {
      key: 'name', title: 'Name', dataType: 'name'/*, options: {
        tooltipType: 'recipe',
      }*/
    },
    {key: 'rank', title: 'Rank', dataType: ColumnTypeEnum.Number, hideOnMobile: true},
    {
      key: 'reagents',
      title: 'Materials (min vs avg price)',
      dataType: 'materials',
      hideOnMobile: true,
      canNotSort: true
    },
    {key: 'cost', title: 'Cost', dataType: 'gold', hideOnMobile: true},
    {key: 'buyout', title: 'Buyout', dataType: 'gold'},
    {key: 'mktPrice', title: 'Market value', dataType: 'gold', hideOnMobile: true},
    {key: 'roi', title: 'Profit', dataType: 'gold'},
    {
      key: 'priceAvg24', title: '24H avg', dataType: 'gold', options: {
        tooltip: 'Avg price, for the past ~24 hours'
      }
    },
    {
      key: 'priceTrend', title: '7 Day trend', dataType: 'gold', options: {
        tooltip: 'Price trend per day, the past 7 days'
      }
    },
    {key: 'regionSaleRate', title: 'Sale rate (TSM)', dataType: 'percent', hideOnMobile: true},
    {
      key: 'past60DaysSaleRate',
      title: 'Pers. sale rate(60)',
      dataType: 'percent',
      options: {
        tooltip: `Displays your personal sale rate, the past 60 days. The calculation is based in data imported via the TSM addon.`
      },
      hideOnMobile: true
    },
    {
      key: 'inventoryQuantity',
      title: 'In inventory',
      dataType: 'number',
      options: {
        tooltip: `The calculation is based in data imported via the TSM addon.`
      },
      hideOnMobile: true
    },
    {
      key: undefined, title: 'In cart', dataType: 'cart-recipe-count', options: {
        idName: 'id',
      }
    }
  ];

  constructor(private _formBuilder: UntypedFormBuilder,
              private service: AuctionsService,
              private realmService: RealmService,
              private settingsService: SettingsService,
              private authService: AuthService,
              private dialog: MatDialog,
              private professionService: ProfessionService) {
    SharedService.events.title.next('Crafting');
    this.craftingFilterUtil = new CraftingFilterUtil(service, realmService, settingsService);
    this.isClassic = realmService.isClassic;

    const query: CraftingFormFilterModel = new CraftingFormFilterModel();

    this.subs.add(ItemClassService.classes, classes => this.itemClasses = classes);

    this.searchForm = new FormGroup({
      searchQuery: new FormControl<string>(query.searchQuery),
      onlyKnownRecipes: new FormControl<boolean>(this.isClassic ? false : query.onlyKnownRecipes),
      professionId: new FormControl<number>(query.professionId),
      rank: new FormControl<number>(query.rank),
      profit: new FormControl<number>(query.profit),
      demand: new FormControl<number>(query.demand),
      personalSaleRate: new FormControl<number>(query.personalSaleRate),
      minSold: new FormControl<number>(query.minSold),
      itemClass: new FormControl<number>(query.itemClass),
      itemSubClass: new FormControl<number>(query.itemSubClass),
      expansion: new FormControl<number>(
        this.isClassic && query.expansion < GameBuild.latestClassicExpansion ? 0 : query.expansion)
    });

    if (authService.isAdmin()) {
      this.columns.push({
        key: '',
        title: 'Edit',
        dataType: ColumnTypeEnum.RowActions,
        actions: [{
          icon: 'fa fa-edit',
          text: '',
          tooltip: 'Edit',
          callback: (group: Recipe) => dialog.open(RecipeDialogComponent, {data: group}),
        }]
      });
    }
  }

  ngOnInit() {
    // this.filter();
    this.subs.add(
      this.realmService.events.realmChanged,
      () => this.expansions = this.craftingFilterUtil.setExpansions()
    );

    this.subs.add(this.searchForm.controls.itemClass.valueChanges,
      () => this.searchForm.controls.itemSubClass.setValue('-1'));
    this.subs.add(
      this.searchForm.valueChanges.pipe(debounceTime(1_000)),
      ((changes) => {
        localStorage['query_crafting'] = JSON.stringify(this.searchForm.value);
        this.filter(changes);
      }));

    this.subs.add(
      this.service.mapped,
      () => this.filter()
    );

    this.subs.add(this.professionService.listWithRecipes, (professions) => {
      this.professions = [
        {
          id: 0,
          name: 'All',
        },
        ...(this.getProfessionsSorted(professions)),
        {
          id: -1,
          name: 'On use'
        }
      ];
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  filter(changes: CraftingFormFilterModel = this.searchForm.value): void {
    this.filtered = this.craftingFilterUtil.getFilteredRecipes(changes);
  }

  resetForm() {
    this.searchForm.reset({
      strategy: SharedService.user.craftingStrategy,
      intermediate: SharedService.user.useIntermediateCrafting
    });
  }

  private getProfessionsSorted(professions) {
    return professions.sort((a, b) => a.name.localeCompare(b.name)) || [];
  }
}