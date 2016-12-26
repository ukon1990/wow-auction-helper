import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { FrontPageComponent } from './components/frontpage/front.page.component';
import { UserComponent } from './components/user/user.component';
import { AuctionComponent } from './components/auctions/auctions.component';

@NgModule({
  declarations: [
    AppComponent,
    UserComponent,
    FrontPageComponent,
    AuctionComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot([
      {
        path: '',
        component: FrontPageComponent
      },{
        path: 'auctions',
        component: AuctionComponent
      }
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
