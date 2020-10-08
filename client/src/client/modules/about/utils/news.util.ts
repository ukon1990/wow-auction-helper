import {ErrorReport} from '../../../utils/error-report.util';
import {BehaviorSubject} from 'rxjs';

declare function require(moduleName: string): any;
const version = require('../../../../../package.json').version;
declare var $;

export class NewsUtil {
  static events: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  static shouldTrigger(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        let displayNews = false;
        try {
          if (localStorage.getItem('realm') &&
            localStorage.getItem('timestamp_news') && localStorage.getItem('timestamp_news') !== version) {
            displayNews = true;
          } else {
            localStorage.setItem('timestamp_news', version);
          }
        } catch (e) {
          ErrorReport.sendError('NewsUtil.shouldTrigger', e);
        }
        this.events.next(displayNews);
        resolve(displayNews);
      }, 1000);
    });
  }
}
