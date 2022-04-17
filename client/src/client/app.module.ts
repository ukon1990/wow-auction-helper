import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HTTP_INTERCEPTORS, HttpClientJsonpModule, HttpClientModule} from '@angular/common/http';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';

import {Angulartics2Module} from 'angulartics2';

import {AppRoutingModule} from './modules/app-routing.module';

import {AppComponent} from './app.component';
import {RealmService} from './services/realm.service';
import {AuctionsService} from './services/auctions.service';
import {DatabaseService} from './services/database.service';
import {ItemService} from './services/item.service';
import {SharedService} from './services/shared.service';
import {CraftingService} from './services/crafting.service';
import {IsRegisteredService} from './Is-registered.service';
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
import {TsmService} from './modules/tsm/tsm.service';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatNativeDateModule} from '@angular/material/core';
import {AuthService} from './modules/user/services/auth.service';
import {DashboardService} from './modules/dashboard/services/dashboard.service';
import {AppSyncService} from './modules/user/services/app-sync.service';
import {Amplify} from 'aws-amplify';
import {APP_SYNC} from './secrets';
import {ItemClassService} from './modules/item/service/item-class.service';

Amplify.configure(APP_SYNC);

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
    NpcModule,
    MatProgressSpinnerModule,
    MatNativeDateModule,
  ],
  providers: [
    RealmService,
    AuctionsService,
    DatabaseService,
    ItemService,
    SharedService,
    CraftingService,
    IsRegisteredService,
    PetsService,
    UpdateService,
    BackgroundDownloadService,
    ReportService,
    ZoneService,
    NpcService,
    ProfessionService,
    TsmService,
    {provide: HTTP_INTERCEPTORS, useClass: AuthenticationInterceptor, multi: true},
    AuthService,
    DashboardService,
    AppSyncService,
    ItemClassService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}