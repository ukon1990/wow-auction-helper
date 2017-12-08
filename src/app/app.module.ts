import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './modules/app-routing.module';

import { AppComponent } from './app.component';
import { MaterialModule } from './modules/material.module';
import { SetupComponent } from './components/setup/setup.component';
import { RealmService } from './services/realm.service';


@NgModule({
  declarations: [
    AppComponent,
    SetupComponent
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
    RealmService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
