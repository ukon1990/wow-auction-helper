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
        platform: navigator.platform
      } as LogEntry)
      .toPromise()
      .then(() => {})
      .catch(console.error);
  }
}
