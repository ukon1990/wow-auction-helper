import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Pet } from '../models/pet';
import { SharedService } from './shared.service';
import { Endpoints } from './endpoints';
import { DatabaseService } from './database.service';

@Injectable()
export class PetsService {

  constructor(private _http: HttpClient, private dbService: DatabaseService) { }

  getPets(): Promise<any> {
    SharedService.downloading.pets = true;
    return this._http.get(Endpoints.getUrl(`pet?locale=${ localStorage['locale'] }`))
      .toPromise()
      .then(pets => {
        SharedService.downloading.pets = false;
        (pets['pets'] as Array<Pet>).forEach(p => {
          SharedService.pets[p.speciesId] = p;
        });

        this.dbService.addPets(pets['pets']);
      })
      .catch(e => {
        SharedService.downloading.pets = false;
        console.error('Failed at downloading pet', e);
      });
  }

  getPet(speciesId): Promise<any> {
    SharedService.downloading.pets = true;
    return this._http.get(Endpoints.getUrl(`pet/${speciesId}?locale=${ localStorage['locale'] }`))
      .toPromise()
      .then(pet => {
        SharedService.downloading.pets = false;
        SharedService.pets[(pet as Pet).speciesId] = pet;
      })
      .catch(e => {
        SharedService.downloading.pets = false;
        console.error('Failed at downloading pet', e);
      });
  }

  updatePet(speciesId): Promise<any> {
    return this._http.patch(Endpoints.getUrl(`pet/${speciesId}`), null)
      .toPromise()
      .then(pet => {
        SharedService.pets[(pet as Pet).speciesId] = pet;
      })
      .catch(e => {
        console.error('Failed at downloading pet', e);
      });
  }
}
