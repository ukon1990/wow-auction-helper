import {Recipe} from './recipe';

export class CustomProc {
  id: number;
  itemID: number;
  name: string;
  professionId: number;
  rank: number;
  rate: number;

  constructor(recipe?: Recipe) {
    if (recipe) {
      this.id = recipe.id;
      this.itemID = recipe.itemID;
      this.name = recipe.name;
      this.professionId = recipe.professionId;
      this.rank = recipe.rank;
      this.rate = recipe.minCount;
    }
  }
}
