import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Pet} from '../modules/pet/models/pet';
import {SharedService} from './shared.service';
import {Endpoints} from './endpoints';
import {DatabaseService} from './database.service';
import {Angulartics2} from 'angulartics2';
import {ErrorReport} from '../utils/error-report.util';
import {Platform} from '@angular/cdk/platform';
import {BehaviorSubject} from 'rxjs';

class PetResponse {
  timestamp: Date;
  pets: Pet[];
}

@Injectable()
export class PetsService {
  readonly LOCAL_STORAGE_TIMESTAMP = 'timestamp_pets';
  mapped: BehaviorSubject<Map<number,  Pet>> = new BehaviorSubject(new Map<number,  Pet>());

  constructor(private _http: HttpClient,
              private dbService: DatabaseService,
              public platform: Platform) {
  }

  async loadPets(latestTimestamp: Date) {
    await this.dbService.getAllPets()
      .then(async () => {
        if (Object.keys(SharedService.pets).length === 0) {
          delete localStorage[this.LOCAL_STORAGE_TIMESTAMP];
        }
      })
      .catch(async error => {
        ErrorReport.sendError('PetService.loadPets', error);
      });

    const timestamp = localStorage.getItem(this.LOCAL_STORAGE_TIMESTAMP);
    if (!timestamp || +new Date(latestTimestamp) > +new Date(timestamp)) {
      await this.getPets();
    }
  }

  async getPets(): Promise<any> {
    const locales = localStorage['locale'];
    SharedService.downloading.pets = true;
    await this._http.get(`${Endpoints.S3_BUCKET}/pet/${locales}.json.gz?rand=${Math.round(Math.random() * 10000)}`)
      .toPromise()
      .then((response: PetResponse) => {
        this.handlePets(response);
        SharedService.downloading.pets = false;
      })
      .catch(error => {
        ErrorReport.sendHttpError(error);
        SharedService.downloading.pets = false;
      });
  }

  handlePets(pets: PetResponse) {
    const map = new Map<number, Pet>();
    SharedService.downloading.pets = false;
    (pets.pets as Array<Pet>).forEach(pet => {
      SharedService.pets[pet.speciesId] = pet;
      map.set(pet.speciesId, pet);
    });

    if (this.platform !== null && !this.platform.WEBKIT) {
      this.dbService.addPets(pets.pets);
      localStorage[this.LOCAL_STORAGE_TIMESTAMP] = new Date(pets.timestamp).toJSON();
    }
    this.mapped.next(map);
  }

  updatePet(speciesId): Promise<any> {
    return this._http.patch(Endpoints.getLambdaUrl(`pet/${speciesId}`), {
      locale: localStorage['locale']
    })
      .toPromise()
      .then(pet => {
        SharedService.pets[(pet as Pet).speciesId] = pet;
      })
      .catch(error => {
        console.error('Failed at downloading pet', error);
        ErrorReport.sendHttpError(error);
      });
  }
}
