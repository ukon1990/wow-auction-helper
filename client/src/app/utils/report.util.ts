import {Angulartics2} from 'angulartics2';
import {environment} from '../../environments/environment';

declare function require(moduleName: string): any;

const version = require('../../../package.json').version;

export class Report {
  private static ga: Angulartics2;

  public static init(googleAnalytics: Angulartics2) {
    Report.ga = googleAnalytics;
  }

  public static send(action: string, category: string): void {
    if (!Report.ga) {
      return;
    }
    Report.ga.eventTrack.next({
      action: action,
      properties: {category: category},
    });
  }

  public static debug(message?: any, ...optionalParams: any[]): void {
    if (!environment.production) {
      console.log(message, optionalParams);
    }
  }
}
