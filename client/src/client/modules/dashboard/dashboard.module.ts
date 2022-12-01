import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DashboardComponent} from './components/dashboard.component';
import {DashboardItemComponent} from './components/dashboard-item/dashboard-item.component';
import {DashboardItemsComponent} from './components/dashboard-items/dashboard-items.component';
import {AhSummaryComponent} from './components/ah-summary/ah-summary.component';
import {SummaryCardComponent} from './components/ah-summary/summary-card/summary-card.component';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatLegacyCardModule as MatCardModule} from '@angular/material/legacy-card';
import {MatLegacyCheckboxModule as MatCheckboxModule} from '@angular/material/legacy-checkbox';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatLegacyPaginatorModule as MatPaginatorModule} from '@angular/material/legacy-paginator';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
import {MatLegacyTabsModule as MatTabsModule} from '@angular/material/legacy-tabs';
import {MatLegacyTooltipModule as MatTooltipModule} from '@angular/material/legacy-tooltip';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TableModule} from '../table/table.module';
import {IconModule} from '../icon/icon.module';
import {UtilModule} from '../util/util.module';
import {RouterModule} from '@angular/router';
import {CraftingModule} from '../crafting/crafting.module';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {ConfigureComponent} from './components/configure/configure.component';
import {MatLegacyDialogModule as MatDialogModule} from '@angular/material/legacy-dialog';
import {RulesComponent} from './components/configure/rules/rules.component';
import {ItemRulesComponent} from './components/configure/item-rules/item-rules.component';
import {MatLegacyAutocompleteModule as MatAutocompleteModule} from '@angular/material/legacy-autocomplete';
import {ColumnsComponent} from './components/configure/columns/columns.component';
import {RuleComponent} from './components/configure/rules/rule/rule.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatLegacyListModule as MatListModule} from '@angular/material/legacy-list';
import {CoreModule} from '../core/core.module';
import {MatStepperModule} from '@angular/material/stepper';
import {DetailsDialogComponent} from './components/dashboard-item/details-dialog/details-dialog.component';
import {MatLegacyChipsModule as MatChipsModule} from '@angular/material/legacy-chips';
import {MatIconModule} from '@angular/material/icon';
import {TagsComponent} from './components/configure/tags/tags.component';
import {SearchComponent} from './components/search/search.component';
import {MatLegacyProgressSpinnerModule as MatProgressSpinnerModule} from '@angular/material/legacy-progress-spinner';

@NgModule({
  declarations: [
    DashboardComponent,
    DashboardItemComponent,
    DashboardItemsComponent,
    AhSummaryComponent,
    SummaryCardComponent,
    ConfigureComponent,
    RulesComponent,
    ItemRulesComponent,
    ColumnsComponent,
    RuleComponent,
    DetailsDialogComponent,
    TagsComponent,
    SearchComponent,
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
    MatStepperModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule
  ]
})
export class DashboardModule {
}