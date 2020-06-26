import {Recipe} from '../models/recipe';
import {SharedService} from '../../../services/shared.service';
import {CustomProc} from '../models/custom-proc.model';

export class CustomProcUtil {

  public static get(recipe: Recipe): number {
    return SharedService.customProcsMap[recipe.id] ?
      SharedService.customProcsMap[recipe.id].rate : recipe.minCount;
  }

  public static add(recipe: Recipe): void {
    if (!SharedService.customProcsMap[recipe.id]) {
      const customProc = new CustomProc(recipe);
      SharedService.customProcsMap[recipe.id] = customProc;
      SharedService.user.customProcs.unshift(customProc);
      CustomProcUtil.save();
    }
  }

  public static remove(customProc: CustomProc, index: number): void {
    SharedService.user.customProcs.splice(index, 1);
    delete SharedService.customProcsMap[customProc.id];
    CustomProcUtil.save();
  }

  public static createMap(customProcs: Array<CustomProc>): void {
    CustomProcUtil.migration(customProcs);
    customProcs.forEach(c =>
      SharedService.customProcsMap[c.id] = c);
  }

  public static save(procs?: CustomProc[]): void {
    localStorage['custom_procs'] = JSON.stringify(procs || SharedService.user.customProcs);
  }

  static migration(procs: CustomProc[]): void {
    if (procs[0] && procs[0]['spellID']) {
      procs.forEach(proc => {
        proc.id = proc['spellID'];
        delete proc['spellID'];
      });
      this.save(procs);
    }
  }
}
