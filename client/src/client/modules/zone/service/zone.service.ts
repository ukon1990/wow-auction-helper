import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Endpoints} from '../../../services/endpoints';
import {BehaviorSubject} from 'rxjs';
import {Zone} from '../models/zone.model';
import {DatabaseService} from '../../../services/database.service';
import {ErrorReport} from '../../../utils/error-report.util';

@Injectable({
  providedIn: 'root'
})
export class ZoneService {
  private storageName = 'timestamp_zone';
  list: BehaviorSubject<Zone[]> = new BehaviorSubject([]);
  mapped: BehaviorSubject<Map<number, Zone>> = new BehaviorSubject(new Map());

  constructor(private http: HttpClient, private dbService: DatabaseService) {
  }

  getAll(): Promise<Zone[]> {
    const locale = localStorage['locale'];
    return new Promise<Zone[]>(async (resolve, reject) => {
      await this.dbService.getAllZones()
        .then(list => this.mapAndSetNextValueForZones(list))
        .catch(console.error);

      if (!this.list.value.length) {
        await this.getAllFromS3();
      }

      await this.getAllAfterTimestamp();
      resolve(this.list.value);
    });
  }

  private getAllFromS3(): Promise<any[]> {
    const locale = localStorage['locale'];
    return new Promise<any[]>((resolve, reject) => {
      this.http.get(`${Endpoints.S3_BUCKET}/zone/${locale}.json.gz`)
        .toPromise()
        .then((response) => {
          localStorage[this.storageName] = response['timestamp'];
          this.mapAndSetNextValueForZones(response['zones']);
          resolve(this.list.value);
        })
        .catch(error => {
          ErrorReport.sendHttpError(error);
          resolve(this.list.value);
        });
    });
  }

  private async getAllAfterTimestamp() {
    const locale = localStorage['locale'];
    return new Promise<Zone[]>((resolve) => {

      this.http.post(Endpoints.getLambdaUrl('zone'),
        {locale, timestamp: localStorage.getItem(this.storageName)})
        .toPromise()
        .then(response => {
          localStorage[this.storageName] = response['timestamp'];
          this.mapAndSetNextValueForZones(response['zones']);
          resolve(this.list.value);
        }).catch(error => {
        ErrorReport.sendHttpError(error);
        resolve(this.list.value);
      });
    });
  }

  private mapAndSetNextValueForZones(newData: Zone[]) {
    const list = [...newData, ...this.list.value],
      map = new Map();
    list.forEach(zone =>
      map.set(zone.id, zone));
    this.mapped.next(map);
    this.list.next(list);
    return list;
  }
}
