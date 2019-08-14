import {Angulartics2} from 'angulartics2';
import {environment} from '../../environments/environment';
import {ReportService} from '../services/report/report.service';
import {SharedService} from '../services/shared.service';

declare function require(moduleName: string): any;

const version = require('../../../package.json').version;

export class Report {
  private static ga: Angulartics2;
  private static service: ReportService;

  public static init(googleAnalytics: Angulartics2, reportService: ReportService) {
    Report.ga = googleAnalytics;
    this.service = reportService;
  }

  public static send(action: string, category: string, label?: string): void {
    if (!Report.ga || !environment.production || SharedService.user.doNotReport) {
      return;
    }
    Report.ga.eventTrack.next({
      action: action,
      properties: {category, version, label},
    });
    this.service.send(action, category, version, 'user-event', label);
  }

  public static debug(message?: any, ...optionalParams: any[]): void {
    if (!environment.production) {
      console.log(message, ...optionalParams);
    }
  }
}
