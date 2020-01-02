import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Endpoints} from '../../../services/endpoints';
import {SharedService} from '../../../services/shared.service';

@Injectable({
  providedIn: 'root'
})
export class NpcService {
  private storageName = 'timestamp_npcs';

  constructor(private http: HttpClient) {
  }

  getAll(): Promise<any[]> {
    const locale = localStorage['locale'];
    return new Promise<any[]>((resolve, reject) => {
      this.http.get(`${Endpoints.S3_BUCKET}/npc/${locale}.json.gz`)
        .toPromise()
        .then((response) => {
          localStorage[this.storageName] = response['timestamp'];
          resolve(response['npcs']);
        })
        .catch(console.error);
    });
    // return this.http.post('http://localhost:3000/npc/all', {locale: 'en_GB'}).toPromise() as Promise<any[]>;
  }

  getIds(ids: number[]) {
    return this.http.post('http://localhost:3000/npc', {ids}).toPromise();
  }
}
