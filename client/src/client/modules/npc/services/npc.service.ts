import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Endpoints} from '../../../services/endpoints';
import {BehaviorSubject} from 'rxjs';
import {NPC} from '../models/npc.model';
import {Report} from '../../../utils/report.util';
import {DatabaseService} from '../../../services/database.service';
import {ErrorReport} from '../../../utils/error-report.util';
import {SharedService} from '../../../services/shared.service';

@Injectable({
  providedIn: 'root'
})
export class NpcService {
  private storageName = 'timestamp_npcs';
  isLoading = false;
  list: BehaviorSubject<NPC[]> = new BehaviorSubject<NPC[]>([]);
  mapped: BehaviorSubject<any> = new BehaviorSubject<any>({});

  constructor(private http: HttpClient, private db: DatabaseService) {
  }

  getAll(forceUpdate = false): Promise<NPC[]> {
    if (forceUpdate) {
      localStorage.removeItem(this.storageName);
    }
    return new Promise<NPC[]>(async (resolve) => {
      await this.db.getAllNPCs()
        .then(list => {
          this.mapAndSetNextValueForNPCs(list);
        })
        .catch(console.error);

      if (!this.list.value.length) {
        await this.getAllFromS3()
          .catch(console.error);
      }

      await this.getAllAfterTimestamp()
        .catch(console.error);

      NPC.getTradeVendorsAndSetUnitPriceIfMissing(this.list.value);
      resolve(this.list.value);
    });
  }

  private getAllFromS3(): Promise<NPC[]> {
    SharedService.downloading.npc = true;
    const locale = localStorage['locale'];
    this.isLoading = true;
    return new Promise<any[]>(async (resolve, reject) => {
      await this.http.get(`${Endpoints.S3_BUCKET}/npc/${locale}.json.gz`)
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

  getAllAfterTimestamp(): Promise<NPC[]> {
    SharedService.downloading.npc = true;
    const locale = localStorage['locale'],
      timestamp = localStorage.getItem(this.storageName);

    if (!timestamp) {
      return this.getAllFromS3();
    }
    return new Promise<NPC[]>((resolve, reject) => {
      this.http.post(Endpoints.getLambdaUrl('npc/all'),
        {locale, timestamp})
        .toPromise()
        .then((response) => {
          SharedService.downloading.npc = false;
          this.db.addNPCs(response['npcs'])
            .catch(console.error);
          this.mapAndSetNextValueForNPCs(response['npcs']);
          resolve(this.list.value);
        })
        .catch((error) => {
          SharedService.downloading.npc = false;
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
}
