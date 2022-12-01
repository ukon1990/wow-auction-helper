import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SetupComponent} from './components/setup/setup.component';
import {NotificationSettingsComponent} from './components/notification-settings/notification-settings.component';
import {GeneralSettingsComponent} from './components/general-settings/general-settings.component';
import {CraftingSettingsComponent} from './components/crafting-settings/crafting-settings.component';
import {RouterModule} from '@angular/router';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatStepperModule } from '@angular/material/stepper';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import {AboutModule} from '../about/about.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RealmListComponent} from './components/realm-list/realm-list.component';
import {TableModule} from '../table/table.module';
import {CharacterModule} from '../character/character.module';
import {SettingsComponent} from './components/settings.component';
import {CustomPricesComponent} from './components/crafting-settings/custom-prices/custom-prices.component';
import {CustomProcComponent} from './components/crafting-settings/custom-proc/custom-proc.component';
import {IconModule} from '../icon/icon.module';
import {UtilModule} from '../util/util.module';
import {CoreModule} from '../core/core.module';
import {MatLegacyListModule as MatListModule} from '@angular/material/legacy-list';
import {CraftingModule} from '../crafting/crafting.module';
import { RealmListDialogComponent } from './components/realm-list/realm-list-dialog/realm-list-dialog.component';
import {MatLegacyDialogModule as MatDialogModule} from '@angular/material/legacy-dialog';
import {MatLegacyProgressSpinnerModule as MatProgressSpinnerModule} from '@angular/material/legacy-progress-spinner';
import {MatExpansionModule} from '@angular/material/expansion';
import {UserModule} from '../user/user.module';

@NgModule({
  declarations: [
    SettingsComponent,
    SetupComponent,
    NotificationSettingsComponent,
    GeneralSettingsComponent,
    CraftingSettingsComponent,
    CustomPricesComponent,
    CustomProcComponent,
    RealmListComponent,
    RealmListDialogComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatTabsModule,
    AboutModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatCheckboxModule,
    TableModule,
    CharacterModule,
    MatInputModule,
    MatTooltipModule,
    IconModule,
    UtilModule,
    CoreModule,
    MatRadioModule,
    MatListModule,
    CraftingModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    UserModule
  ],
  exports: [RealmListComponent]
})
export class SettingsModule {
}
