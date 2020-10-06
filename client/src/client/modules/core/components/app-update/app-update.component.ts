import {Component, Inject, OnDestroy} from '@angular/core';
import {Report} from '../../../../utils/report.util';
import {ChangeLog} from '../../../about/models/github/commit/changelog.model';
import {GithubService} from '../../../about/services/github.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

declare function require(moduleName: string): any;
const version = require('../../../../../../package.json').version;

@Component({
  selector: 'wah-app-update',
  templateUrl: './app-update.component.html',
  styleUrls: ['./app-update.component.scss']
})
export class AppUpdateComponent implements OnDestroy {
  changelog: ChangeLog[];

  constructor(
    private service: GithubService,
    public dialogRef: MatDialogRef<AppUpdateComponent>,
    @Inject(MAT_DIALOG_DATA) public input: string | any) {
    Report.send('Popup displayed', 'Update available');
  }

  ngOnDestroy() {
    localStorage.setItem('timestamp_news', this.service.latestVersion);
  }

  reload(): void {
    Report.send(`Reload to update from ${version} to ${this.service.latestVersion}`, 'Update available');
    localStorage.setItem('timestamp_news', this.service.latestVersion);
    this.dialogRef.close();
    window.location.reload();
  }

  close(): void {
    Report.send('Popup closed', 'Update available');
    this.dialogRef.close();
  }
}
