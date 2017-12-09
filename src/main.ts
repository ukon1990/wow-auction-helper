import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import { Observable } from 'rxjs/Observable';
import { startWith } from 'rxjs/operators/startWith';

import 'rxjs/add/operator/map';
import { filter } from 'rxjs/operators/filter';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
