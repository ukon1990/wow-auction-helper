import { SharedService } from '../../services/shared.service';
import { Recipe } from './recipe';

export class CustomProcs {

  public static get(recipe: Recipe): number {
    return SharedService.customProcsMap[recipe.spellID] ?
      SharedService.customProcsMap[recipe.spellID].rate : recipe.minCount;
  }

  public static add(recipe: Recipe): void {
    if (!SharedService.customProcsMap[recipe.spellID]) {
      const customProc = new CustomProc(recipe);
      SharedService.customProcsMap[recipe.spellID] = customProc;
      SharedService.user.customProcs.unshift(customProc);
      CustomProcs.save();
    }
  }

  public static remove(customProc: CustomProc, index: number): void {
    SharedService.user.customProcs.splice(index, 1);
    delete SharedService.customProcsMap[customProc.spellID];
    CustomProcs.save();
  }

  public static createMap(customProcs: Array<CustomProc>): void {
    customProcs.forEach(c =>
      SharedService.customProcsMap[c.spellID] = c);
  }

  public static save(): void {
    localStorage['custom_procs'] = JSON.stringify(SharedService.user.customProcs);
  }
}

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
