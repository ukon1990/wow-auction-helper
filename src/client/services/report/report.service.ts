import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Endpoints} from '../endpoints';
import {LogEntry} from '../../../lambda/models/log-entry.model';
import {SharedService} from '../shared.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(private http: HttpClient) {
  }

  send(action: string, category: string, version: string, type: string, label?: string): void {
    if (SharedService.user.doNotReport) {
      return;
    }
    this.http.post(
      Endpoints.getLambdaUrl('logger/client-event'),
      {
        action, category, version, label, type,
        region: SharedService.user.region,
        locale: localStorage['locale'],
        browserLocale: navigator.language,
        isClassic: false,
        platform: navigator.platform,
        userId: localStorage.getItem('logUserId')
      } as LogEntry)
      .toPromise()
      .then((res) => {
        localStorage.setItem('logUserId', res['userId']);
      })
      .catch(console.error);
  }

  delete(): Promise<any> {
    return this.http.delete(
      Endpoints.getLambdaUrl('logger/client-event'))
      .toPromise()
      .then(r =>
        localStorage.removeItem('logUserId'));
  }
}
