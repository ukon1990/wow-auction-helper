import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DashboardComponent} from './components/dashboard.component';
import {DashboardItemComponent} from './components/dashboard-item/dashboard-item.component';
import {DashboardItemsComponent} from './components/dashboard-items/dashboard-items.component';
import {DashboardSellersComponent} from './components/dashboard-sellers/dashboard-sellers.component';
import {ManageItemsBuiltInComponent} from './components/manage/manage-items-built-in/manage-items-built-in.component';
import {ManageItemsBuiltInItemComponent} from './components/manage/manage-items-built-in-item/manage-items-built-in-item.component';
import {AhSummaryComponent} from './components/ah-summary/ah-summary.component';
import {SummaryCardComponent} from './components/ah-summary/summary-card/summary-card.component';
import {WatchlistComponent} from './components/manage/watchlist.component';
import {WatchlistItemComponent} from './components/manage/watchlist-item/watchlist-item.component';
import {WatchlistManagerComponent} from './components/manage/watchlist-manager/watchlist-manager.component';
import {WatchlistItemManagerComponent} from './components/manage/watchlist-item-manager/watchlist-item-manager.component';
import {WatchlistItemBatchComponent} from './components/manage/watchlist-item-batch/watchlist-item-batch.component';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatInputModule} from '@angular/material/input';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSelectModule} from '@angular/material/select';
import {MatTabsModule} from '@angular/material/tabs';
import {MatTooltipModule} from '@angular/material/tooltip';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TableModule} from '../table/table.module';
import {IconModule} from '../icon/icon.module';
import {UtilModule} from '../util/util.module';
import {RouterModule} from '@angular/router';
import {ManageCustomDashboardComponent} from './components/manage/manage-custom-dashboard/manage-custom-dashboard.component';
import {CraftingModule} from '../crafting/crafting.module';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {ConfigureComponent} from './components/configure/configure.component';
import {MatDialogModule} from '@angular/material/dialog';
import { RulesComponent } from './components/configure/rules/rules.component';
import { ItemRulesComponent } from './components/configure/item-rules/item-rules.component';
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import { ColumnsComponent } from './components/configure/columns/columns.component';
import { RuleComponent } from './components/configure/rules/rule/rule.component';
import {DragDropModule} from '@angular/cdk/drag-drop';

@NgModule({
    declarations: [
        DashboardComponent,
        DashboardItemComponent,
        DashboardItemsComponent,
        DashboardSellersComponent,
        ManageItemsBuiltInComponent,
        ManageItemsBuiltInItemComponent,
        AhSummaryComponent,
        SummaryCardComponent,
        WatchlistComponent,
        WatchlistItemComponent,
        WatchlistManagerComponent,
        WatchlistItemManagerComponent,
        WatchlistItemBatchComponent,
        ManageCustomDashboardComponent,
        ConfigureComponent,
        RulesComponent,
        ItemRulesComponent,
        ColumnsComponent,
        RuleComponent,
    ],
  imports: [
    CommonModule,
    MatTabsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatInputModule,
    MatTooltipModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatSelectModule,
    TableModule,
    MatExpansionModule,
    IconModule,
    UtilModule,
    RouterModule,
    MatPaginatorModule,
    CraftingModule,
    FontAwesomeModule,
    MatDialogModule,
    MatAutocompleteModule,
    DragDropModule
  ]
})
export class DashboardModule {
}
