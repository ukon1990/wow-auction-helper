import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './components/list/list.component';
import { DetailsComponent } from './components/details/details.component';
import {TableModule} from '../table/table.module';
import {MatLegacyCardModule as MatCardModule} from '@angular/material/legacy-card';
import {MatLegacyTabsModule as MatTabsModule} from '@angular/material/legacy-tabs';
import {RouterModule} from '@angular/router';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {UtilModule} from '../util/util.module';
import {ReactiveFormsModule} from '@angular/forms';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';



@NgModule({
  declarations: [ListComponent, DetailsComponent],
  imports: [
    CommonModule,
    TableModule,
    MatCardModule,
    MatTabsModule,
    RouterModule,
    MatButtonModule,
    UtilModule,
    ReactiveFormsModule,
    MatInputModule
  ]
})
export class NpcModule { }
