import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Subscription} from 'rxjs';
import {Profession} from '@shared/models';
import {SharedService} from '../../../services/shared.service';
import {ErrorReport} from '../../../utils/error-report.util';
import {DatabaseService} from '../../../services/database.service';
import {Endpoints} from '../../../services/endpoints';
import {CraftingService} from '../../../services/crafting.service';
import {Recipe} from '../models/recipe';

class ProfessionResponse {
  timestamp: Date;
  professions: Profession[];
}

@Injectable({
  providedIn: 'root'
})
export class ProfessionService {
  private LOCAL_STORAGE_TIMESTAMP = 'timestamp_professions';
  list: BehaviorSubject<Profession[]> = new BehaviorSubject<Profession[]>([]);
  listWithRecipes: BehaviorSubject<Profession[]> = new BehaviorSubject<Profession[]>([]);
  map: BehaviorSubject<Map<number, Profession>> = new BehaviorSubject<Map<number, Profession>>(
    new Map<number, Profession>());
  craftingSubscription: Subscription;
  lastModified: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient, private dbService: DatabaseService) {
    this.craftingSubscription = CraftingService.list.subscribe((data) => {
      this.mapProfessionsWithRecipes(data);
    });
  }

  private mapProfessionsWithRecipes(data: Recipe[]) {
    const map = new Map<number, Profession>(),
      list: Profession[] = [];
    data.forEach(recipe => {
      if (!map.has(recipe.professionId)) {
        const profession = this.map.value.get(recipe.professionId);
        if (profession) {
          map.set(recipe.professionId, profession);
          list.push(profession);
        }
      }
    });
    this.listWithRecipes.next(list);
  }

  load(latestTimestamp: Date): Promise<void> {
    return new Promise<void>(async (resolve) => {
      if (localStorage.getItem(this.LOCAL_STORAGE_TIMESTAMP)) {
        await this.dbService.getAllProfessions()
          .then(async (professions) => {
            this.setSubjects(professions);
            if (this.list.value.length === 0) {
              delete localStorage[this.LOCAL_STORAGE_TIMESTAMP];
            }
          })
          .catch(async error => {
            ErrorReport.sendError('ProfessionService.load', error);
          });
      }

      let timestamp: string | number = localStorage.getItem(this.LOCAL_STORAGE_TIMESTAMP);
      if (!timestamp || timestamp === 'undefined') {
        timestamp = 0;
      }
      if (!this.list.value.length || !timestamp || +new Date(latestTimestamp) > +new Date(timestamp)) {
        await this.getAll();
      }
      resolve();
    });
  }

  async getAll(): Promise<any> {
    const locales = localStorage['locale'];
    SharedService.downloading.professions = true;

    await this.dbService.clearProfessions();
    await this.http.get(`${Endpoints.S3_BUCKET}/profession/${locales}.json.gz?lastModified=${this.lastModified.value}`)
      .toPromise()
      .then((response: ProfessionResponse) => {
        this.dbService.addProfessions(response.professions);
        this.setSubjects(response.professions);
        localStorage.setItem(this.LOCAL_STORAGE_TIMESTAMP, '' + response.timestamp);
        SharedService.downloading.professions = false;
      })
      .catch(error => {
        ErrorReport.sendHttpError(error);
        SharedService.downloading.professions = false;
      });
  }

  setSubjects(professions: Profession[]): void {
    const map = new Map<number, Profession>();
    professions.forEach(profession => {
      map.set(profession.id, profession);
    });

    this.mapProfessionsWithRecipes(CraftingService.list.value);
    this.map.next(map);
    this.list.next(professions);
  }

  getProfessionById(id) {
    return this.list.value.filter(profession =>
      profession.id === id)[0];
  }
}