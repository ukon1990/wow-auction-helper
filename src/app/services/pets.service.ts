import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Pet } from '../models/pet';
import { SharedService } from './shared.service';
import { Endpoints } from './endpoints';

@Injectable()
export class PetsService {

  constructor(private _http: HttpClient) { }

  getPets(): Promise<any> {
    SharedService.downloading.pets = true;
    return this._http.get(`${Endpoints.WAH_API}GetSpecies.php`)
      .toPromise()
      .then(pets => {
        SharedService.downloading.pets = false;
        (pets['pets'] as Array<Pet>).forEach(p => {
          SharedService.pets[p.speciesId] = p;
        });
      })
      .catch(e => {
        SharedService.downloading.pets = false;
        console.error('Failed at downloading pets', e);
      });
  }
}
