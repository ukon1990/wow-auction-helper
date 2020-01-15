import {Injectable, EventEmitter} from '@angular/core';

import {MatSnackBar} from '@angular/material';
import {SwUpdate, UpdateAvailableEvent} from '@angular/service-worker';
import {Report} from '../utils/report.util';

declare function require(moduleName: string): any;

const version = require('../../../package.json').version;

@Injectable()
export class UpdateService {
  public events = new EventEmitter<UpdateAvailableEvent>();

  constructor(private swUpdate: SwUpdate, private matSnackBar: MatSnackBar) {
    this.swUpdate.available.subscribe((evt: UpdateAvailableEvent) => {
      this.events.emit(evt);
      const snack = this.matSnackBar
        .open(
          'There is an update Available!',
          'Reload',
          {duration: 3000});

      snack
        .onAction()
        .subscribe(() => this.update());
    });
  }

  update(): void {
    Report.send(`Reload to update from ${version}`, 'Update available');
    window.location.reload();
  }
}
