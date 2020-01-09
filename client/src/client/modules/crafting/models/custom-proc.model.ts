import {Recipe} from './recipe';

export class CustomProc {
  spellID: number;
  itemID: number;
  name: string;
  profession: string;
  rank: string;
  rate: number;

  constructor(recipe?: Recipe) {
    if (recipe) {
      this.spellID = recipe.spellID;
      this.itemID = recipe.itemID;
      this.name = recipe.name;
      this.profession = recipe.profession;
      this.rank = recipe.rank;
      this.rate = recipe.minCount;
    }
  }
}
