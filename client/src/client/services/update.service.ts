import { Injectable, EventEmitter } from '@angular/core';

import { MatSnackBar } from '@angular/material';
import { SwUpdate, UpdateAvailableEvent } from '@angular/service-worker';

@Injectable()
export class UpdateService {
  public static events = new EventEmitter<UpdateAvailableEvent>();
  constructor(private swUpdate: SwUpdate, private matSnackBar: MatSnackBar) {
    this.swUpdate.available.subscribe((evt: UpdateAvailableEvent) => {
      UpdateService.events.emit(evt);
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
