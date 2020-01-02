import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Endpoints} from '../../../services/endpoints';
import {BehaviorSubject} from 'rxjs';
import {Zone} from '../models/zone.model';

@Injectable({
  providedIn: 'root'
})
export class ZoneService {
  private storageName = 'timestamp_zone';
  list: BehaviorSubject<Zone[]> = new BehaviorSubject([]);
  mapped: BehaviorSubject<Map<number, Zone>> = new BehaviorSubject(new Map());

  constructor(private http: HttpClient) {
  }

  getAll(): Promise<any[]> {
    const locale = localStorage['locale'];
    return new Promise<any[]>((resolve, reject) => {
      this.http.get(`${Endpoints.S3_BUCKET}/zone/${locale}.json.gz`)
        .toPromise()
        .then((response) => {
          const list = response['zones'],
            map = new Map();
          localStorage[this.storageName] = response['timestamp'];
          list.forEach(zone =>
            map.set(zone.id, zone));
          this.mapped.next(map);
          this.list.next(list);
          resolve(list);
        })
        .catch(console.error);
    });
    // return this.http.post('http://localhost:3000/npc/all', {locale: 'en_GB'}).toPromise() as Promise<any[]>;
  }

  getIds(ids: number[]) {
    return this.http.post('http://localhost:3000/npc', {ids}).toPromise();
  }
}
