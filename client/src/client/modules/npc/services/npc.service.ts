import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NpcService {

  constructor(private http: HttpClient) {
  }

  getAll(): Promise<any[]> {
    return this.http.post('http://localhost:3000/npc/all', {locale: 'en_GB'}).toPromise() as Promise<any[]>;
  }

  getIds(ids: number[]) {
    return this.http.post('http://localhost:3000/npc', {ids}).toPromise();
  }
}
