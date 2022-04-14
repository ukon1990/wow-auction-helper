import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Subscription} from 'rxjs';
import {ItemClass, ItemClassLocale} from '../models/item-class.model';
import {Endpoints} from '../../../services/endpoints';
import {SettingsService} from '../../user/services/settings/settings.service';

@Injectable({
  providedIn: 'root'
})
export class ItemClassService {

  private static itemClassesLocales = new BehaviorSubject<ItemClassLocale[]>([]);
  static classes: BehaviorSubject<ItemClass[]> = new BehaviorSubject<ItemClass[]>([]);
  static map: BehaviorSubject<Map<number, ItemClass>> = new BehaviorSubject(new Map<number, ItemClass>());
  private subscriptions: Subscription = new Subscription();

  constructor(private http: HttpClient, private settings: SettingsService) {
    this.subscriptions.add(settings.settings.subscribe(
      setting => ItemClassService.setForLocale(setting.locale)));
    this.subscriptions.add(ItemClassService.itemClassesLocales.subscribe(
      setting => ItemClassService.setForLocale(settings.settings.value?.locale)));
  }

  private static setForLocale(locale: string = localStorage.getItem('locale') || 'en_GB'): void {
    const map = new Map<number, ItemClass>();
    const reMapped = this.itemClassesLocales.value.map(
      ({id, name, subClasses}) => {

          const subClassesMap = new Map<number, ItemClass>();
          const subClassesMapped = subClasses.map(sub => {
            const subClass = {
              id: sub.id,
              name: sub.name[locale]
            };
            subClassesMap.set(sub.id, subClass);
            return subClass;
          });

        const itemClass: ItemClass = {
          id,
          name: name[locale],
          map: subClassesMap,
          subClasses: subClassesMapped,
        };

        map.set(id, itemClass);
        return itemClass;
      });

    this.classes.next(reMapped);
    this.map.next(map);
  }

  async getAll(): Promise<any> {
    await this.http.get(`${Endpoints.S3_BUCKET}/item/item-classes.json.gz`).toPromise()
      .then((res: ItemClassLocale[]) => {
        ItemClassService.itemClassesLocales.next(res);
      })
      .catch(console.error);
  }
}