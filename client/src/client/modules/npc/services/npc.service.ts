import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Endpoints} from '../../../services/endpoints';
import {BehaviorSubject} from 'rxjs';
import {NPC} from '../models/npc.model';
import {Report} from '../../../utils/report.util';

@Injectable({
  providedIn: 'root'
})
export class NpcService {
  private storageName = 'timestamp_npcs';
  isLoading = false;
  list: BehaviorSubject<NPC[]> = new BehaviorSubject<NPC[]>([]);
  mapped: BehaviorSubject<any> = new BehaviorSubject<any>({});

  constructor(private http: HttpClient) {
  }

  getAll(): Promise<NPC[]> {
    const locale = localStorage['locale'];
    this.isLoading = true;
    return new Promise<any[]>(async (resolve, reject) => {
      await this.http.get(`${Endpoints.S3_BUCKET}/npc/${locale}.json.gz`)
        .toPromise()
        .then((response) => {
          const list = response['npcs'],
            map = {};
          this.isLoading = false;
          localStorage[this.storageName] = response['timestamp'];
          list.forEach(npc => map[npc.id] = npc);
          this.list.next(list);
          this.mapped.next(map);
          resolve(list);
          NPC.getTradeVendors(this.list.value);
          Report.debug('NPC trade vendors');
          this.getAllAfterTimestamp().then().catch();
        })
        .catch(console.error);
    });
  }

  getAllAfterTimestamp(): Promise<NPC[]> {
    return new Promise<NPC[]>((resolve, reject) => {
      this.http.post('http://localhost:3000/npc/all',
        {locale: 'en_GB', timestamp: localStorage.getItem(this.storageName)})
        .toPromise()
        .then((response) => {
          // TODO: Set timestamp
          const list = [...response['npcs'], ...this.list.value],
            map = {};
          list.forEach(npc => map[npc.id] = npc);
          this.list.next(list);
          this.mapped.next(map);
        })
        .catch(console.error);
    });
  }

  getIds(ids: number[]) {
    return this.http.post('http://localhost:3000/npc', {ids}).toPromise();
  }
}
