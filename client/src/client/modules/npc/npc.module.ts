import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './components/list/list.component';
import { DetailsComponent } from './components/details/details.component';
import {TableModule} from '../table/table.module';
import {MatCardModule} from '@angular/material/card';
import {MatTabsModule} from '@angular/material/tabs';
import {RouterModule} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {UtilModule} from '../util/util.module';



@NgModule({
  declarations: [ListComponent, DetailsComponent],
  imports: [
    CommonModule,
    TableModule,
    MatCardModule,
    MatTabsModule,
    RouterModule,
    MatButtonModule,
    UtilModule
  ]
})
export class NpcModule { }
