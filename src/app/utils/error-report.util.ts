import { Angulartics2 } from 'angulartics2';
import { HttpErrorResponse } from '@angular/common/http';
import { SharedService } from '../services/shared.service';
import { MatSnackBar } from '@angular/material';
declare function require(moduleName: string): any;
const version = require('../../../package.json').version;

export class ErrorReport {
  private static ga: Angulartics2;
  public static sb: MatSnackBar;

  public static init(googleAnalytics: Angulartics2, snackBar: MatSnackBar) {
    ErrorReport.ga = googleAnalytics;
    ErrorReport.sb = snackBar;
  }

  public static sendHttpError(error: HttpErrorResponse, options?: ErrorOptions): void {
    if (error.status !== 0 && error.status !== undefined) {
      ErrorReport.ga.eventTrack.next({
        action: `${error.status} - ${error.statusText}`,
        properties: {
          category: `Http errors (${ version })`,
          label: `${ error.url } - ${ SharedService.user.realm }@${ SharedService.user.region }`
        },
      });

      console.error(error.name, error.error);

      if (options) {
        ErrorReport.sb.open(
          `${ options.message + ' - ' }${ error.status } - ${ error.statusText }`,
          'Ok',
          {duration: 4000});
      }
    }
  }

  public static sendError(functionName: string, error: Error, options?: ErrorOptions): void {
    ErrorReport.ga.eventTrack.next({
      action: functionName,
      properties: {
        category: `Errors (${ version })`,
        label: `${ error.name } - ${ error.message } - ${ error.stack }`
      },
    });

    console.error(functionName, error);

    if (options) {
      ErrorReport.sb.open(
        `${error.name}`,
        'Ok',
        {duration: 4000});
    }
  }
}

export class ErrorOptions {
  constructor(public useSnackBar: boolean, public message?: string) {}
}
