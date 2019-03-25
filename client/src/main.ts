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
.then(() => {
  if ('serviceWorker' in navigator && environment.production) {
    navigator.serviceWorker.register('/ngsw-worker.js');
  }
}).catch(err => console.log(err));
