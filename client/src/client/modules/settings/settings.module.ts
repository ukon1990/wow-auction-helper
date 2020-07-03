import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SetupComponent} from './components/setup/setup.component';
import {NotificationSettingsComponent} from './components/notification-settings/notification-settings.component';
import {GeneralSettingsComponent} from './components/general-settings/general-settings.component';
import {CraftingSettingsComponent} from './components/crafting-settings/crafting-settings.component';
import {RouterModule} from '@angular/router';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
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
import {MatListModule} from '@angular/material/list';
import {CraftingModule} from '../crafting/crafting.module';

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
    MatRadioModule,
    MatListModule,
    CraftingModule
  ],
  exports: [RealmListComponent]
})
export class SettingsModule {
}
