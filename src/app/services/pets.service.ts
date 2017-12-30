import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Pet } from '../models/pet';
import { SharedService } from './shared.service';

@Injectable()
export class PetsService {

  constructor(private _http: HttpClient) { }

  getPets(): Promise<any> {
    return this._http.get(`assets/mock/pets.json`)
      .toPromise()
      .then(pets => {
        (pets['pets'] as Array<Pet>).forEach(p => {
          SharedService.pets[p.speciesId] = p;
        });
      })
      .catch(e => console.error('Failed at downloading pets', e));
  }
}
