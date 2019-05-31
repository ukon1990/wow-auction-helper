import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SetupComponent} from './components/setup/setup.component';
import {SelectRealmComponent} from './components/select-realm/select-realm.component';
import {NotificationSettingsComponent} from './components/notification-settings/notification-settings.component';
import {GeneralSettingsComponent} from './components/general-settings/general-settings.component';
import {CraftingSettingsComponent} from './components/crafting-settings/crafting-settings.component';
import {CharactersComponent} from './components/characters/characters.component';
import {CharacterComponent} from './components/characters/character/character.component';
import {RouterModule} from '@angular/router';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatFormFieldModule,
  MatSelectModule,
  MatSlideToggleModule,
  MatStepperModule,
  MatTabsModule
} from '@angular/material';
import {AboutModule} from '../about/about.module';
import {ReactiveFormsModule} from '@angular/forms';
import {RealmListComponent} from './components/realm-list/realm-list.component';
import {TableModule} from '../table/table.module';
import {SettingsRouteModule} from './settings-route.module';

@NgModule({
  declarations: [
    SetupComponent,
    SelectRealmComponent,
    NotificationSettingsComponent,
    GeneralSettingsComponent,
    CraftingSettingsComponent,
    CharactersComponent,
    CharacterComponent,
    RealmListComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatTabsModule,
    AboutModule,
    MatStepperModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatCheckboxModule,
    TableModule,
    SettingsRouteModule
  ],
  exports: [CharacterComponent, RealmListComponent]
})
export class SettingsModule {
}
