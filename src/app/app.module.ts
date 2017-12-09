import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './modules/app-routing.module';

import { AppComponent } from './app.component';
import { MaterialModule } from './modules/material.module';
import { SetupComponent } from './components/setup/setup.component';
import { RealmService } from './services/realm.service';
import { CharactersComponent } from './components/settings/characters/characters.component';
import { CharacterComponent } from './components/settings/characters/character/character.component';
import { CharacterService } from './services/character.service';
import { AuctionsService } from './services/auctions.service';
import { DatabaseService } from './services/database.service';
import { ItemService } from './services/item.service';
import { NavbarComponent } from './components/navbar/navbar.component';


@NgModule({
  declarations: [
    AppComponent,
    SetupComponent,
    CharactersComponent,
    CharacterComponent,
    NavbarComponent
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
    ItemService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
