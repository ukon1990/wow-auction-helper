import {Endpoints} from '../endpoints.util';

export class Recipev2Util {
  // https://eu.api.blizzard.com/data/wow/recipe/1631?namespace=static-e

  getRecipeFromAPI(id: number): void {
    const url = new Endpoints().getPath(`recipe${id}`, 'eu', 'static-eu');
  }
}

