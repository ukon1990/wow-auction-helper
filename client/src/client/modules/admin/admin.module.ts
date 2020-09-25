import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AddItemsComponent} from './components/update/add-items/add-items.component';
import {UpdateComponent} from './components/update/update.component';
import {ReactiveFormsModule} from '@angular/forms';
import {TableModule} from '../table/table.module';
import { AddNpcsComponent } from './components/add-npcs/add-npcs.component';
import {MatCardModule} from '@angular/material/card';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatTabsModule} from '@angular/material/tabs';
import { MonitorComponent } from './components/monitor/monitor.component';
import {AdminService} from './services/admin.service';


@NgModule({
  declarations: [
    UpdateComponent,
    AddItemsComponent,
    AddNpcsComponent,
    MonitorComponent,
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressBarModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatTabsModule,
    TableModule
  ],
  providers: [AdminService]
})
export class AdminModule {
}
