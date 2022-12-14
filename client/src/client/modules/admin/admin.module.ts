import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AddItemsComponent} from './components/update/add-items/add-items.component';
import {UpdateComponent} from './components/update/update.component';
import {ReactiveFormsModule} from '@angular/forms';
import {TableModule} from '../table/table.module';
import {AddNpcsComponent} from './components/add-npcs/add-npcs.component';
import {MatCardModule} from '@angular/material/card';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatTabsModule} from '@angular/material/tabs';
import {MonitorDatabaseComponent} from './components/monitor-database/monitor-database.component';
import {AdminService} from './services/admin.service';
import {UtilModule} from '../util/util.module';
import {MatListModule} from '@angular/material/list';
import {TestComponent} from './components/test/test.component';
import {ItemModule} from '../item/item.module';
import {UserModule} from '../user/user.module';
import {UsersComponent} from './components/users/users.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {RealmComponent} from './components/realm/realm.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {RecipeComponent} from './components/recipe/recipe.component';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { RecipeDialogComponent } from './components/recipe/recipe-dialog/recipe-dialog.component';
import {MatDialogModule} from "@angular/material/dialog";
import {IconModule} from "../icon/icon.module";


@NgModule({
  declarations: [
    UpdateComponent,
    AddItemsComponent,
    AddNpcsComponent,
    MonitorDatabaseComponent,
    TestComponent,
    UsersComponent,
    RealmComponent,
    RecipeComponent,
    RecipeDialogComponent,
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
    TableModule,
    UtilModule,
    MatListModule,
    ItemModule,
    UserModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatGridListModule,
    MatDatepickerModule,
    MatDialogModule,
    IconModule
  ],
  providers: [
    AdminService
  ]
})
export class AdminModule {
}