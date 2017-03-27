import { BrowserModule, Title } from '@angular/platform-browser';
import {HashLocationStrategy, Location, LocationStrategy} from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { Ng2AutoCompleteModule} from 'ng2-auto-complete';

import { AppComponent } from './app.component';
import { FrontPageComponent } from './components/frontpage/front.page.component';
import { AuctionComponent } from './components/auctions/auctions.component';
import { CraftingComponent } from './components/crafting/crafting.component';
import { MyAuctionsComponent } from './components/auctions/my.auctions.component';
import { AboutComponent } from './components/about/about.component';
import { SettingsComponent } from './components/settings/settings.component';

import { AuctionService } from './services/auctions';
import { ItemService } from './services/item';

@NgModule({
	declarations: [
		AppComponent,
		FrontPageComponent,
		AuctionComponent,
		CraftingComponent,
		MyAuctionsComponent,
		AboutComponent,
		SettingsComponent
	],
	imports: [
		BrowserModule,
		FormsModule,
		ReactiveFormsModule,
		HttpModule,
		Ng2AutoCompleteModule,
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
				path: 'about',
				component: AboutComponent
			}, {
				path: 'settings',
				component: SettingsComponent
			}
		])
	],
	providers: [
		AuctionService,
		ItemService,
		Title,
		Location,
		{provide: LocationStrategy, useClass: HashLocationStrategy}],
	bootstrap: [AppComponent]
})
export class AppModule { }
