import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Endpoints} from '../../../services/endpoints';
import {BehaviorSubject} from 'rxjs';
import {NPC} from '../models/npc.model';
import {Report} from '../../../utils/report.util';
import {DatabaseService} from '../../../services/database.service';
import {ErrorReport} from '../../../utils/error-report.util';
import {SharedService} from '../../../services/shared.service';
import {ItemNpcDetails} from '../../item/models/item-npc-details.model';
import {ZoneService} from '../../zone/service/zone.service';

@Injectable({
  providedIn: 'root'
})
export class NpcService {
  private storageName = 'timestamp_npcs';
  isLoading = false;
  list: BehaviorSubject<NPC[]> = new BehaviorSubject<NPC[]>([]);
  mapped: BehaviorSubject<any> = new BehaviorSubject<any>({});

  constructor(private http: HttpClient, private db: DatabaseService, private zoneService: ZoneService) {
  }

  getAll(forceUpdate = false, latestTimestamp?: Date): Promise<NPC[]> {
    if (forceUpdate) {
      localStorage.removeItem(this.storageName);
    }
    return new Promise<NPC[]>(async (resolve) => {
      const timestamp = localStorage.getItem(this.storageName);
      await this.db.getAllNPCs()
        .then(list => {
          this.mapAndSetNextValueForNPCs(list);
        })
        .catch(error =>
          ErrorReport.sendError('NpcService.getAll', error));

      if (!this.list.value.length || !timestamp || +new Date(latestTimestamp) > +new Date(timestamp)) {
        await this.getAllFromS3()
          .catch(console.error);
      }

      NPC.getTradeVendorsAndSetUnitPriceIfMissing(this.list.value);

      this.mapNPCsToItems();
      resolve(this.list.value);
    });
  }

  private getAllFromS3(): Promise<NPC[]> {
    SharedService.downloading.npc = true;
    const locale = localStorage['locale'];
    this.isLoading = true;
    return new Promise<any[]>(async (resolve, reject) => {
      await this.http.get(`${Endpoints.S3_BUCKET}/npc/${locale}.json.gz?rand=${Math.round(Math.random() * 10000)}`)
        .toPromise()
        .then((response) => {
          SharedService.downloading.npc = false;
          const list = response['npcs'],
            map = {};
          this.isLoading = false;
          this.setTimestamp(response);
          this.mapAndSetNextValueForNPCs(response['npcs']);
          this.db.addNPCs(response['npcs'])
            .catch(console.error);
          resolve(list);
        })
        .catch(error => {
          SharedService.downloading.npc = false;
          console.error(error);
          ErrorReport.sendHttpError(error);
        });
    });
  }

  private setTimestamp(response: Object) {
    if (!response['timestamp']) {
      return;
    }
    localStorage[this.storageName] = response['timestamp'];
  }

  private mapAndSetNextValueForNPCs(newData: NPC[]) {
    const map = {},
      list = [...newData, ...this.list.value];
    this.list.next(list);
    this.list.value.forEach(npc =>
      map[npc.id] = npc);
    this.mapped.next(map);
  }

  getIds(ids: number[]) {
    return this.http.post('http://localhost:3000/npc', {ids}).toPromise();
  }

  private mapNPCsToItems() {
    const map: Map<number, ItemNpcDetails> = new Map();
    this.list.value.forEach(npc => {
      (npc.drops || []).forEach(item => {
        if (!map.has(item.id)) {
          map.set(item.id, new ItemNpcDetails(this, this.zoneService));
        }
        map.get(item.id).addDroppedBy(item, npc);
      });

      (npc.sells || []).forEach(item => {
        if (!map.has(item.id)) {
          map.set(item.id, new ItemNpcDetails(this, this.zoneService));
        }
        map.get(item.id).addSoldBy(item, npc);
      });
    });

    SharedService.itemNpcMap = map;
  }
}
