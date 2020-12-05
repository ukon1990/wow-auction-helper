import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject} from 'rxjs';
import {ItemClass, ItemClassLocale} from '../models/item-class.model';
import {Endpoints} from '../../../services/endpoints';

@Injectable({
  providedIn: 'root'
})
export class ItemClassService {

  constructor(private http: HttpClient) {
  }
  private static itemClassesLocales = new BehaviorSubject<ItemClassLocale[]>([]);

  static getForLocale(locale: string = localStorage.getItem('locale') || 'en_GB'): ItemClass[] {
    return this.itemClassesLocales.value.map(
      ({id, name, subClasses}) => ({
        id,
        name: name[locale],
        subClasses: subClasses.map(sub => ({
          id: sub.id,
          name: sub.name[locale]
        })),
      }));
  }

  async getAll(): Promise<any> {
    await this.http.get(`${Endpoints.S3_BUCKET}/item/item-classes.json.gz`).toPromise()
      .then((res: ItemClassLocale[]) => ItemClassService.itemClassesLocales.next(res))
      .catch(console.error);
  }
}
