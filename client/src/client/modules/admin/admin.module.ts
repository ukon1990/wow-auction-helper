import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AddItemsComponent} from './components/update/add-items/add-items.component';
import {UpdateComponent} from './components/update/update.component';
import {ReactiveFormsModule} from '@angular/forms';
import {TableModule} from '../table/table.module';
import {AddNpcsComponent} from './components/add-npcs/add-npcs.component';
import {MatLegacyCardModule as MatCardModule} from '@angular/material/legacy-card';
import {MatLegacyProgressBarModule as MatProgressBarModule} from '@angular/material/legacy-progress-bar';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatLegacyTabsModule as MatTabsModule} from '@angular/material/legacy-tabs';
import {MonitorDatabaseComponent} from './components/monitor-database/monitor-database.component';
import {AdminService} from './services/admin.service';
import {UtilModule} from '../util/util.module';
import {MatLegacyListModule as MatListModule} from '@angular/material/legacy-list';
import {TestComponent} from './components/test/test.component';
import {ItemModule} from '../item/item.module';
import {UserModule} from '../user/user.module';
import {UsersComponent} from './components/users/users.component';
import {MatLegacyProgressSpinnerModule as MatProgressSpinnerModule} from '@angular/material/legacy-progress-spinner';
import {RealmComponent} from './components/realm/realm.component';
import {MatLegacyCheckboxModule as MatCheckboxModule} from '@angular/material/legacy-checkbox';
import {RecipeComponent} from './components/recipe/recipe.component';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatGridListModule} from '@angular/material/grid-list';


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
    MatGridListModule
  ],
  providers: [
    AdminService
  ]
})
export class AdminModule {
}