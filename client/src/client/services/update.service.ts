import {Injectable} from '@angular/core';

import {MatSnackBar} from '@angular/material/snack-bar';
import {SwUpdate, UpdateAvailableEvent} from '@angular/service-worker';
import {GithubService} from '../modules/about/services/github.service';
import {MatDialog} from '@angular/material/dialog';
import {AppUpdateComponent} from '../modules/core/components/app-update/app-update.component';

declare function require(moduleName: string): any;
const version = require('../../../package.json').version;

@Injectable()
export class UpdateService {

  constructor(private swUpdate: SwUpdate,
              private matSnackBar: MatSnackBar,
              private dialog: MatDialog,
              private githubService: GithubService) {
    this.swUpdate.available.subscribe((evt: UpdateAvailableEvent) => {
      console.log('Service  worker update available', evt);
      this.initiateUpdateDialog();
    });
  }

  private initiateUpdateDialog() {
    this.githubService.getChangeLogs()
      .then(() => {
        if (this.githubService.latestVersion === version) {
          return;
        }
        this.dialog.open(AppUpdateComponent, {
          width: '95%',
          maxWidth: '100%',
        });
      })
      .catch(console.error);
  }
}
