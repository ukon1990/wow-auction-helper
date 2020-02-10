import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {CraftingComponent} from './components/crafting.component';
import {MillingComponent} from './components/milling/milling.component';
import {DisenchantingComponent} from './components/disenchanting/disenchanting.component';
import {DataBoardsComponent} from './components/data-boards/data-boards.component';
import {ShuffleItemManageComponent} from './components/shuffle-item-manage/shuffle-item-manage.component';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatCardModule, MatCheckboxModule,
  MatFormFieldModule, MatInputModule,
  MatPaginatorModule, MatSelectModule,
  MatTabsModule,
  MatTooltipModule
} from '@angular/material';
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
