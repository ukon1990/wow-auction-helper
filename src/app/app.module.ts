import { BrowserModule, Title } from '@angular/platform-browser';
import { HashLocationStrategy, Location, LocationStrategy } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { MaterialModule } from './modules/material.module';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import 'hammerjs';

import { AppComponent } from './app.component';
import { FrontPageComponent } from './components/frontpage/front.page.component';
import { AuctionComponent } from './components/auctions/auctions.component';
import { CraftingComponent } from './components/crafting/crafting.component';
import { ShoppingCartComponent } from './components/crafting/shopping.cart.component';
import { CraftTableComponent } from './components/crafting/craft/craft.table.component';
import { MyAuctionsComponent } from './components/auctions/my.auctions.component';
import { AboutComponent } from './components/about/about.component';
import { TradeVendorComponent } from './components/trade_vendor/trade.vendor.component';
import { SettingsComponent } from './components/settings/settings.component';

import { AuctionService } from './services/auctions.service';
import { CharacterService } from './services/character.service';
import { ItemService } from './services/item.service';
import { WatchlistComponent } from './components/watchlist/watchlist.component';
import { NewsComponent } from './components/news/news.component';
import { GoldPipe } from './pipes/gold.pipe';
import { FileService } from './services/file.service';
import { ExportComponent } from './components/export/export.component';
import { SortIconComponent } from './components/sort-icon/sort-icon.component';
import { ShuffleComponent } from './components/shuffle/shuffle.component';
import { HeaderComponent } from './components/header/header.component';
import { AutocompleteComponent } from './components/autocomplete/autocomplete.component';
import { RealmService } from './services/realm.service';
import { DownloadsComponent } from './components/downloads/downloads.component';
import { CharactersComponent } from './components/settings/characters/characters.component';
import { CharacterComponent } from './components/settings/characters/character/character.component';

@NgModule({
	declarations: [
		AppComponent,
		FrontPageComponent,
		AuctionComponent,
		CraftingComponent,
		MyAuctionsComponent,
		TradeVendorComponent,
		AboutComponent,
		SettingsComponent,
		WatchlistComponent,
		NewsComponent,
		ShoppingCartComponent,
		CraftTableComponent,
		ExportComponent,
		SortIconComponent,
		ShuffleComponent,
		HeaderComponent,
		GoldPipe,
		AutocompleteComponent,
		DownloadsComponent,
		CharactersComponent,
		CharacterComponent
	],
	imports: [
		BrowserModule,
		FormsModule,
		ReactiveFormsModule,
		HttpModule,
		HttpClientModule,
		MaterialModule,
		RouterModule.forRoot([
			{
				path: '',
				component: FrontPageComponent
			}, {
				path: 'auctions',
				component: AuctionComponent
			}, {
				path: 'crafting',
				component: CraftingComponent
			}, {
				path: 'my-auctions',
				component: MyAuctionsComponent
			}, {
				path: 'trade-vendor',
				component: TradeVendorComponent
			}, {
				path: 'watchlist',
				component: WatchlistComponent
			}, {
				path: 'shuffle',
				component: ShuffleComponent
			}, {
				path: 'about',
				component: AboutComponent
			}, {
				path: 'settings',
				component: SettingsComponent
			}, {
				path: 'settings/:setting',
				component: SettingsComponent
			}
		])
	],
	providers: [
		AuctionService,
		CharacterService,
		FileService,
		ItemService,
		RealmService,
		Title,
		Location],
	bootstrap: [AppComponent]
})
export class AppModule {}
