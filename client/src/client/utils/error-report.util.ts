import {Angulartics2} from 'angulartics2';
import {HttpErrorResponse} from '@angular/common/http';
import {SharedService} from '../services/shared.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {environment} from '../../environments/environment';
import {ReportService} from '../services/report/report.service';

declare function require(moduleName: string): any;

const version = require('../../../package.json').version;

export class ErrorReport {
  public static sb: MatSnackBar;
  private static ga: Angulartics2;
  private static service: ReportService;

  public static init(googleAnalytics: Angulartics2, snackBar: MatSnackBar, reportService: ReportService) {
    ErrorReport.ga = googleAnalytics;
    ErrorReport.sb = snackBar;
    this.service = reportService;
  }

  public static sendHttpError(error: HttpErrorResponse, options?: ErrorOptions): void {
    console.error(error.name, error.error);

    if (options && options.useSnackBar) {
      this.sb.open(
        `Error ${error.status}: ${options.message || error.message}`,
        'Ok',
        {duration: 3000, panelClass: ['mat-toolbar', 'mat-warn']});
    }

    if (!this.doNotReport() && error.status !== 0 && error.status !== undefined) {
      const action = `${error.status} - ${error.statusText}`;
      const category = `Http errors (${version})`;
      const label = `${error.url} - ${SharedService.user.realm}@${SharedService.user.region}`;
      ErrorReport.ga.eventTrack.next({
        action: action,
        properties: {
          category: category,
          label: label,
          version
        },
      });
      // this.service.send(action, category, version, 'error-http', label);
    }
  }

  private static doNotReport() {
    return !ErrorReport.ga || !environment.production || SharedService.user.doNotReport;
  }

  public static sendError(functionName: string, error: Error, options?: ErrorOptions): void {

    console.error(functionName, error);
    if (!this.doNotReport()) {
      const action = `Error: ${functionName}`;
      const category = `Errors (${version})`;
      const label = `${functionName}: ${error.name} - ${error.message} - ${error.stack}`;

      ErrorReport.ga.eventTrack.next({
        action,
        properties: {
          category,
          label,
          version
        },
      });
    }

    if (options) {
      ErrorReport.sb.open(
        `${error.name}`,
        'Ok',
        {duration: 6000});
    }
  }
}

export class ErrorOptions {
  constructor(public useSnackBar: boolean, public message?: string) {
  }
}