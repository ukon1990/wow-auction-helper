import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Endpoints} from '../../../services/endpoints';
import {BehaviorSubject} from 'rxjs';
import {Zone} from '../models/zone.model';
import {DatabaseService} from '../../../services/database.service';
import {ErrorReport} from '../../../utils/error-report.util';
import {SharedService} from '../../../services/shared.service';

@Injectable({
  providedIn: 'root'
})
export class ZoneService {
  private storageName = 'timestamp_zone';
  list: BehaviorSubject<Zone[]> = new BehaviorSubject([]);
  mapped: BehaviorSubject<Map<number, Zone>> = new BehaviorSubject(new Map());

  constructor(private http: HttpClient, private dbService: DatabaseService) {
  }

  getAll(forceUpdate = false, latestTimestamp?: Date): Promise<Zone[]> {
    if (forceUpdate) {
      localStorage.removeItem(this.storageName);
    }
    const locale = localStorage['locale'];
    return new Promise<Zone[]>(async (resolve, reject) => {
      await this.dbService.getAllZones()
        .then(list => this.mapAndSetNextValueForZones(list))
        .catch(console.error);


      const timestamp = localStorage.getItem(this.storageName);
      if (!this.list.value.length || !timestamp || +latestTimestamp > +new Date(timestamp)) {
        await this.getAllFromS3();
      }
      resolve(this.list.value);
    });
  }

  private getAllFromS3(): Promise<any[]> {
    SharedService.downloading.zone = true;
    const locale = localStorage['locale'];
    return new Promise<any[]>((resolve, reject) => {
      this.http.get(`${Endpoints.S3_BUCKET}/zone/${locale}.json.gz`)
        .toPromise()
        .then(async (response) => {
          SharedService.downloading.zone = false;
          this.setTimestamp(response);
          this.mapAndSetNextValueForZones(response['zones']);
          await this.dbService.addZones(response['zones']);
          resolve(this.list.value);
        })
        .catch(error => {
          SharedService.downloading.zone = false;
          ErrorReport.sendHttpError(error);
          resolve(this.list.value);
        });
    });
  }

  private setTimestamp(response: Object) {
    if (!response['timestamp']) {
      return;
    }
    localStorage[this.storageName] = response['timestamp'];
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
