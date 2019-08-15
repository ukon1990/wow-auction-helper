import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SetupComponent} from './components/setup/setup.component';
import {NotificationSettingsComponent} from './components/notification-settings/notification-settings.component';
import {GeneralSettingsComponent} from './components/general-settings/general-settings.component';
import {CraftingSettingsComponent} from './components/crafting-settings/crafting-settings.component';
import {RouterModule} from '@angular/router';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatFormFieldModule,
  MatInputModule,
  MatRadioModule,
  MatSelectModule,
  MatSlideToggleModule,
  MatStepperModule,
  MatTabsModule,
  MatTooltipModule
} from '@angular/material';
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

@NgModule({
  declarations: [
    SettingsComponent,
    SetupComponent,
    NotificationSettingsComponent,
    GeneralSettingsComponent,
    CraftingSettingsComponent,
    CustomPricesComponent,
    CustomProcComponent,
    RealmListComponent
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
    MatRadioModule
  ],
  exports: [RealmListComponent]
})
export class SettingsModule {
}
