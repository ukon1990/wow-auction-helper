import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Pet } from '../models/pet';
import { SharedService } from './shared.service';
import { Endpoints } from './endpoints';
import { DatabaseService } from './database.service';
import { Angulartics2 } from 'angulartics2';
import { ErrorReport } from '../utils/error-report.util';

@Injectable()
export class PetsService {
  readonly LOCAL_STORAGE_TIMESTAMP = 'timestamp_pets';

  constructor(private _http: HttpClient,
    private dbService: DatabaseService,
    private angulartics2: Angulartics2) { }

  getPets(): Promise<any> {
    SharedService.downloading.pets = true;
    return this._http.post(
      Endpoints.getUrl(`pet?locale=${localStorage['locale']}`),
      {
        timestamp: localStorage[this.LOCAL_STORAGE_TIMESTAMP] ?
          localStorage[this.LOCAL_STORAGE_TIMESTAMP] : new Date('2000-06-30').toJSON()
      })
      .toPromise()
      .then(pets => {
        SharedService.downloading.pets = false;
        (pets['pets'] as Array<Pet>).forEach(p => {
          SharedService.pets[p.speciesId] = p;
        });

        this.dbService.addPets(pets['pets']);
        localStorage[this.LOCAL_STORAGE_TIMESTAMP] = new Date().toJSON();
      })
      .catch(error => {
        SharedService.downloading.pets = false;
        console.error('Failed at downloading pet', error);
        ErrorReport.sendHttpError(error, this.angulartics2);
      });
  }

  getPet(speciesId): Promise<any> {
    SharedService.downloading.pets = true;
    return this._http.get(Endpoints.getUrl(`pet/${speciesId}?locale=${localStorage['locale']}`))
      .toPromise()
      .then(pet => {
        SharedService.downloading.pets = false;
        SharedService.pets[(pet as Pet).speciesId] = pet;
      })
      .catch(error => {
        SharedService.downloading.pets = false;
        console.error('Failed at downloading pet', error);
        ErrorReport.sendHttpError(error, this.angulartics2);
      });
  }

  updatePet(speciesId): Promise<any> {
    return this._http.patch(Endpoints.getUrl(`pet/${speciesId}`), null)
      .toPromise()
      .then(pet => {
        SharedService.pets[(pet as Pet).speciesId] = pet;
      })
      .catch(error => {
        console.error('Failed at downloading pet', error);
        ErrorReport.sendHttpError(error, this.angulartics2);
      });
  }
}
