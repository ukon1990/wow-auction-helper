import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Chart } from 'chart.js';
import 'hammerjs';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import { Observable } from 'rxjs';
import { startWith, filter, map } from 'rxjs/operators';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
