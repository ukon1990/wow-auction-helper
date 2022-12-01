import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {CraftingComponent} from './components/crafting.component';
import {MillingComponent} from './components/milling/milling.component';
import {DisenchantingComponent} from './components/disenchanting/disenchanting.component';
import {DataBoardsComponent} from './components/data-boards/data-boards.component';
import {ShuffleItemManageComponent} from './components/shuffle-item-manage/shuffle-item-manage.component';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import {IconModule} from '../icon/icon.module';
import {TableModule} from '../table/table.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {UtilModule} from '../util/util.module';
import { ConfigComponent } from './components/config/config.component';

@NgModule({
  declarations: [
    CraftingComponent,
    MillingComponent,
    DisenchantingComponent,
    DataBoardsComponent,
    ShuffleItemManageComponent,
    ConfigComponent],
  exports: [
    ConfigComponent
  ],
  imports: [
    CommonModule,
    MatTabsModule,
    MatPaginatorModule,
    MatCardModule,
    IconModule,
    MatTooltipModule,
    TableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    MatSelectModule,
    MatCheckboxModule,
    UtilModule
  ]
})
export class CraftingModule { }
