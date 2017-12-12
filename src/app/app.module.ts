import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './modules/app-routing.module';

import { AppComponent } from './app.component';
import { MaterialModule } from './modules/material.module';
import { SetupComponent } from './components/settings/setup/setup.component';
import { RealmService } from './services/realm.service';
import { CharactersComponent } from './components/settings/characters/characters.component';
import { CharacterComponent } from './components/settings/characters/character/character.component';
import { CharacterService } from './services/character.service';
import { AuctionsService } from './services/auctions.service';
import { DatabaseService } from './services/database.service';
import { ItemService } from './services/item.service';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SharedService } from './services/shared.service';
import { MenuComponent } from './components/navbar/menu/menu.component';
import { DataTableComponent } from './components/data-table/data-table.component';
import { CraftingComponent } from './components/crafting/crafting.component';
import { SettingsComponent } from './components/settings/settings.component';
import { CraftingService } from './services/crafting.service';
import { GoldPipe } from './pipes/gold.pipe';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { IsRegisteredService } from './Is-registered.service';


@NgModule({
  declarations: [
    AppComponent,
    SetupComponent,
    CharactersComponent,
    CharacterComponent,
    NavbarComponent,
    MenuComponent,
    DataTableComponent,
    CraftingComponent,
    SettingsComponent,
    GoldPipe,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [
    RealmService,
    CharacterService,
    AuctionsService,
    DatabaseService,
    ItemService,
    SharedService,
    CraftingService,
    IsRegisteredService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
