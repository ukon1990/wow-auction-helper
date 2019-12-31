import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AddItemsComponent} from './components/update/add-items/add-items.component';
import {AddRecipesComponent} from './components/update/add-recipes/add-recipes.component';
import {UpdateComponent} from './components/update/update.component';
import {
  MatCardModule, MatSelectModule, MatProgressBarModule,
  MatButtonModule, MatFormFieldModule, MatInputModule,
  MatTabsModule
} from '@angular/material';
import {ReactiveFormsModule} from '@angular/forms';
import {TableModule} from '../table/table.module';
import { AddNpcsComponent } from './components/add-npcs/add-npcs.component';


@NgModule({
  declarations: [
    UpdateComponent,
    AddItemsComponent,
    AddRecipesComponent,
    AddRecipesComponent,
    AddNpcsComponent
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
  ]
})
export class AdminModule {
}
