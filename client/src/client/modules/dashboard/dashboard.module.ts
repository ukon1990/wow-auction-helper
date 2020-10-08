import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DashboardComponent} from './components/dashboard.component';
import {DashboardItemComponent} from './components/dashboard-item/dashboard-item.component';
import {DashboardItemsComponent} from './components/dashboard-items/dashboard-items.component';
import {DashboardSellersComponent} from './components/dashboard-sellers/dashboard-sellers.component';
import {AhSummaryComponent} from './components/ah-summary/ah-summary.component';
import {SummaryCardComponent} from './components/ah-summary/summary-card/summary-card.component';
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
import {CraftingModule} from '../crafting/crafting.module';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {ConfigureComponent} from './components/configure/configure.component';
import {MatDialogModule} from '@angular/material/dialog';
import {RulesComponent} from './components/configure/rules/rules.component';
import {ItemRulesComponent} from './components/configure/item-rules/item-rules.component';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {ColumnsComponent} from './components/configure/columns/columns.component';
import {RuleComponent} from './components/configure/rules/rule/rule.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatListModule} from '@angular/material/list';
import { MigrationComponent } from './components/migration/migration.component';
import {CoreModule} from '../core/core.module';
import {MatStepperModule} from '@angular/material/stepper';
import { DetailsDialogComponent } from './components/dashboard-item/details-dialog/details-dialog.component';

@NgModule({
  declarations: [
    DashboardComponent,
    DashboardItemComponent,
    DashboardItemsComponent,
    DashboardSellersComponent,
    AhSummaryComponent,
    SummaryCardComponent,
    ConfigureComponent,
    RulesComponent,
    ItemRulesComponent,
    ColumnsComponent,
    RuleComponent,
    MigrationComponent,
    DetailsDialogComponent,
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
    DragDropModule,
    MatDatepickerModule,
    MatListModule,
    CoreModule,
    MatStepperModule
  ]
})
export class DashboardModule {
}
