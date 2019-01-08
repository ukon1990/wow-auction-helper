import { Angulartics2 } from 'angulartics2';
import { HttpErrorResponse } from '@angular/common/http';
import { SharedService } from '../services/shared.service';
import { MatSnackBar } from '@angular/material';
declare function require(moduleName: string): any;
const version = require('../../../package.json').version;

export class Report {
  private static ga: Angulartics2;

  public static init(googleAnalytics: Angulartics2) {
    Report.ga = googleAnalytics;
  }

  public static send(action: string, category: string): void {
    Report.ga.eventTrack.next({
      action: action,
      properties: { category: category },
    });
  }

}
