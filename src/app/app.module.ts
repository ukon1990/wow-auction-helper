import { BrowserModule, Title } from '@angular/platform-browser';
import { HashLocationStrategy, Location, LocationStrategy } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { FrontPageComponent } from './components/frontpage/front.page.component';
import { AuctionComponent } from './components/auctions/auctions.component';
import { CraftingComponent } from './components/crafting/crafting.component';
import { MyAuctionsComponent } from './components/auctions/my.auctions.component';
import { AboutComponent } from './components/about/about.component';
import { TradeVendorComponent } from './components/trade_vendor/trade.vendor.component';
import { SettingsComponent } from './components/settings/settings.component';

import { AuctionService } from './services/auctions';
import { CharacterService } from './services/character.service';
import { ItemService } from './services/item';
import { WatchlistComponent } from './components/watchlist/watchlist.component';
import { NewsComponent } from './components/news/news.component';

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
		NewsComponent
	],
	imports: [
		BrowserModule,
		FormsModule,
		ReactiveFormsModule,
		HttpModule,
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
		ItemService,
		Title,
		Location,
		{provide: LocationStrategy, useClass: HashLocationStrategy}],
	bootstrap: [AppComponent]
})
export class AppModule { }
