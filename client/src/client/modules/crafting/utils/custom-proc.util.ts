import {Recipe} from '../models/recipe';
import {SharedService} from '../../../services/shared.service';
import {CustomProc} from '../models/custom-proc.model';

export class CustomProcUtil {

  public static get(recipe: Recipe): number {
    return SharedService.customProcsMap[recipe.spellID] ?
      SharedService.customProcsMap[recipe.spellID].rate : recipe.minCount;
  }

  public static add(recipe: Recipe): void {
    if (!SharedService.customProcsMap[recipe.spellID]) {
      const customProc = new CustomProc(recipe);
      SharedService.customProcsMap[recipe.spellID] = customProc;
      SharedService.user.customProcs.unshift(customProc);
      CustomProcUtil.save();
    }
  }

  public static remove(customProc: CustomProc, index: number): void {
    SharedService.user.customProcs.splice(index, 1);
    delete SharedService.customProcsMap[customProc.spellID];
    CustomProcUtil.save();
  }

  public static createMap(customProcs: Array<CustomProc>): void {
    customProcs.forEach(c =>
      SharedService.customProcsMap[c.spellID] = c);
  }

  public static save(): void {
    localStorage['custom_procs'] = JSON.stringify(SharedService.user.customProcs);
  }
}
