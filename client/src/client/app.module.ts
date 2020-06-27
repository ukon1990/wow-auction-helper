import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HTTP_INTERCEPTORS, HttpClientJsonpModule, HttpClientModule} from '@angular/common/http';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';

import {Angulartics2Module} from 'angulartics2';

import {AppRoutingModule} from './modules/app-routing.module';

import {AppComponent} from './app.component';
import {RealmService} from './services/realm.service';
import {CharacterService} from './services/character.service';
import {AuctionsService} from './services/auctions.service';
import {DatabaseService} from './services/database.service';
import {ItemService} from './services/item.service';
import {SharedService} from './services/shared.service';
import {CraftingService} from './services/crafting.service';
import {IsRegisteredService} from './Is-registered.service';
import {WowdbService} from './services/wowdb.service';
import {PetsService} from './services/pets.service';
import {UpdateService} from './services/update.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {PlatformModule} from '@angular/cdk/platform';
import {SettingsModule} from './modules/settings/settings.module';
import {TableModule} from './modules/table/table.module';
import {CoreModule} from './modules/core/core.module';
import { MatCardModule } from '@angular/material/card';
import {AboutModule} from './modules/about/about.module';
import {DashboardModule} from './modules/dashboard/dashboard.module';
import {CraftingModule} from './modules/crafting/crafting.module';
import {PetModule} from './modules/pet/pet.module';
import {AuctionModule} from './modules/auction/auction.module';
import {ShoppingCartModule} from './modules/shopping-cart/shopping-cart.module';
import {AddonModule} from './modules/addon/addon.module';
import {BackgroundDownloadService} from './modules/core/services/background-download.service';
import {ReportService} from './services/report/report.service';
import {AuthenticationInterceptor} from './auth.interceptor';
import {ZoneService} from './modules/zone/service/zone.service';
import {NpcService} from './modules/npc/services/npc.service';
import {ItemModule} from './modules/item/item.module';
import {AdminModule} from './modules/admin/admin.module';
import {NpcModule} from './modules/npc/npc.module';
import {ProfessionService} from './modules/crafting/services/profession.service';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    HttpClientJsonpModule,
    Angulartics2Module.forRoot(),
    ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production}),
    BrowserAnimationsModule,
    PlatformModule,
    CoreModule,
    SettingsModule,
    TableModule,
    MatCardModule,
    AboutModule,
    DashboardModule,
    PetModule,
    CraftingModule,
    AuctionModule,
    ShoppingCartModule,
    AddonModule,
    ItemModule,
    AdminModule,
    NpcModule
  ],
  providers: [
    RealmService,
    CharacterService,
    AuctionsService,
    DatabaseService,
    ItemService,
    SharedService,
    CraftingService,
    IsRegisteredService,
    WowdbService,
    PetsService,
    UpdateService,
    BackgroundDownloadService,
    ReportService,
    ZoneService,
    NpcService,
    ProfessionService,
    {provide: HTTP_INTERCEPTORS, useClass: AuthenticationInterceptor, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
