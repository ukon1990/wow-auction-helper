import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {CraftingComponent} from './components/crafting.component';
import {MillingComponent} from './components/milling/milling.component';
import {DisenchantingComponent} from './components/disenchanting/disenchanting.component';
import {DataBoardsComponent} from './components/data-boards/data-boards.component';
import {ShuffleItemManageComponent} from './components/shuffle-item-manage/shuffle-item-manage.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
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
