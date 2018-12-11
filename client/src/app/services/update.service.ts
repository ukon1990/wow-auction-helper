import { Injectable } from '@angular/core';

import { MatSnackBar } from '@angular/material';
import { SwUpdate } from '@angular/service-worker';

@Injectable()
export class UpdateService {
  constructor(private swUpdate: SwUpdate, private matSnackBar: MatSnackBar) {
    this.swUpdate.available.subscribe(evt => {
      const snack = this.matSnackBar
        .open(
          'There is an update Available!',
          'Reload',
          { duration: 3000 });

      snack
        .onAction()
        .subscribe(() => {
          window.location.reload();
        });
    });
  }
}
