import {
  WoWHead,
  WoWHeadContainedInItem,
  WoWHeadContainedInObject,
  WoWHeadCurrencyFor,
  WoWHeadDroppedBy,
  WoWHeadProspectedFrom,
  WoWHeadSoldBy
} from '../models/item/wowhead';
import * as request from 'request';
import {ArrayUtil} from '@ukon1990/js-utilities';

export class WoWHeadUtil {

  static pctStackRegex = /,["]{0,1}pctstack["]{0,1}:{([\s\S]*?)}/g;

  // .replace(/,["]{0,1}pctstack["]{0,1}:{([\s\S]*?)}/g, 'tiss');
  public static setValuesAll(body: string): WoWHead {
    const wh: WoWHead = new WoWHead();
    const patchAndExpansion = WoWHeadUtil.getExpansion(body);
    wh.expansionId = patchAndExpansion.expansionId;
    wh.patch = patchAndExpansion.patch;
    // wh.createdBy = undefined;
    wh.containedInItem = WoWHeadUtil.getContainedInItem(body);
    wh.containedInObject = WoWHeadUtil.getContainedInObject(body); // contained-in-object
    wh.currencyFor = WoWHeadUtil.getCurrencyFor(body);
    // wh.objectiveOf = undefined;
    wh.soldBy = WoWHeadUtil.getSoldBy(body);
    wh.droppedBy = WoWHeadUtil.getDroppedBy(body);
    wh.prospectedFrom = WoWHeadUtil.getProspectedFrom(body);
    wh.milledFrom = WoWHeadUtil.getMilledFrom(body);
    wh.classicPhase = WoWHeadUtil.getClassicPhaseFrom(body);
    return wh;
  }

  static getExpansion(body: string): { patch: string; expansionId: number; } {
    const expansionRegex = new RegExp(/Added in patch [0-9]{1,2}\.[0-9]{1,2}.[0-9]{1,8}.[0-9]{1,8}/g),
      addedIn = expansionRegex.exec(body);
    if (addedIn && addedIn[0]) {
      const patch = addedIn[0].replace('Added in patch ', '');
      return {
        patch,
        expansionId: parseInt(patch.split('.')[0], 10) - 1
      };
    }
    return {
      patch: '',
      expansionId: 0
    };
  }

  private static getMilledFrom(body: string): WoWHeadProspectedFrom[] {
    const data = this.getNewListViewData<WoWHeadProspectedFrom>(body, 'item', 'milled-from');

    data.forEach((item: WoWHeadProspectedFrom) => {
      item.dropChance = item.count / item.outof;
      delete item.classs;
      delete item.flags2;
      delete item.slot;
      delete item.subclass;
      delete item.source;
      delete item.sourcemore;
      delete item.level;
      item.name = WoWHeadUtil.cleanName(item.name);
    });

    return data;
  }

  private static getProspectedFrom(body: string): WoWHeadProspectedFrom[] {
    const data = this.getNewListViewData<WoWHeadProspectedFrom>(body, 'item', 'prospected-from');

    data.forEach((item: WoWHeadProspectedFrom) => {
      item.dropChance = item.count / item.outof;
      delete item.classs;
      delete item.flags2;
      delete item.slot;
      delete item.subclass;
      delete item.source;
      delete item.sourcemore;
      delete item.level;
      item.name = WoWHeadUtil.cleanName(item.name);
    });

    return data;
  }


  private static getDroppedBy(body: string): WoWHeadDroppedBy[] {
    const data = this.getNewListViewData<WoWHeadDroppedBy>(body, 'npc', 'dropped-by');
    data.forEach((npc: WoWHeadDroppedBy) => {
      npc.dropChance = npc.count / npc.outof;
      delete npc.pctstack;
      delete npc.personal_loot;
      delete npc.classification;
      npc.name = WoWHeadUtil.cleanName(npc.name);
    });
    return data;
  }

  private static getSoldBy(body: string): WoWHeadSoldBy[] {
    const data = this.getNewListViewData<WoWHeadSoldBy>(body, 'npc', 'sold-by');
    // const currency = WoWHeadUtil.getCurrency(body);

    return data;
  }

  private static setCurrency(source: any): void {
    if ((source.cost as Array<any>).length > 0 && source.cost[2] && source.cost[2][0]) {
      source.currency = source.cost[2][0][0];
      source.cost = source.cost[2][0][1];
    } else {
      source.cost = source.cost[0];
    }
  }

  private static getCurrencyFor(body: string): WoWHeadCurrencyFor[] {
    const data = this.getNewListViewData<WoWHeadCurrencyFor>(body, 'item', 'currency-for');

    data.forEach((item: WoWHeadCurrencyFor) => {
      WoWHeadUtil.setCurrency(item);
      delete item.classs;
      delete item.flags2;
      delete item.subclass;
      delete item.slot;
      delete item.skill;
      item.name = WoWHeadUtil.cleanName(item.name);
    });
    return data;
  }

  private static getContainedInItem(body: string): WoWHeadContainedInItem[] {
    const data = this.getNewListViewData<WoWHeadContainedInItem>(body, 'item', 'contained-in-item');

    data.forEach((item: WoWHeadContainedInItem) => {
      item.dropChance = item.count / item.outof;
      delete item.classs;
      delete item.flags2;
      delete item.subclass;
      delete item.level;
      item.name = WoWHeadUtil.cleanName(item.name);
    });

    return data;
  }

  private static getContainedInObject(body: string): WoWHeadContainedInObject[] {
    const data = this.getNewListViewData<WoWHeadContainedInObject>(body, 'object', 'contained-in-object');

    data.forEach((item: WoWHeadContainedInObject) => {
      item.dropChance = item.count / item.outof;
      delete item['pctstack'];
      delete item.type;
      item.name = WoWHeadUtil.cleanName(item.name);
    });
    return data;
  }

  /* istanbul ignore next */
  private static getWowheadDataList<T>(body: string, templateName: string, idName: string, keys: {
    remove: string[],
    transform: { id: string, callback: Function }[]
  }): T[] {
    const data = this.getNewListViewData<T>(body, templateName, idName);

    if (keys) {
      data.forEach((obj: T) => {
        if (keys.remove) {
          keys.remove
            .forEach(k =>
              delete obj[k]);
        }

        if (keys.transform) {
          keys.transform
            .forEach(t =>
              obj[t.id] = t.callback(obj[t.id]));
        }
      });
    }

    return data;
  }

  public static getWowHeadData(id: number, isClassic = false): Promise<WoWHead> {
    return new Promise<WoWHead>(((resolve, reject) => {
      request.get(
        `http://${isClassic ? 'tbc' : 'www'}.wowhead.com/item=${id}`,
        null,
        (whError, whResponse, whBody) => {
          if (whError) {
            reject(`Could not find the item with id=${id} on WoWHead`);
          }

          resolve(
            WoWHeadUtil.setValuesAll(whBody));
        });
    }));
  }

  public static getNewListViewData<T>(body: string, template: string, id: string): T[] {
    const firstRegex = new RegExp(`new Listview\\({[\\n\\r ]{0,}template: ['"]{1,1}${
      template
    }['"]{1,1},[\\n\\r ]{0,}id: ['"]{1,1}${
      id
    }['"]{1,1},([\\s\\S]*?)}\\);`, 'g');
    const result = firstRegex.exec(body);
    if (!ArrayUtil.isArray(result) || result.length < 2) {
      return [];
    }
    try {
      const dataRegex = /(data:[ \r\n]{0,1}\[\{[\s\S]*?(\}\][,]{0,1})$){1,}/gm;
      const dataResult = dataRegex.exec(result[1]);
      if (dataResult && dataResult.length) {
        const totalCount = this.getTotalCount(result);
        // tslint:disable-next-line:no-eval direct-eval
        return eval(dataResult[0].replace('data: ', '')
          .replace(/,$/g, '')).map(entry => ({
          ...entry, totalCount
        }));
      }
      return [];
    } catch (e) {
      console.error('err', e);
      return [];
    }
  }

  static getArrayVariable(variableName: string, body: string) {
    const regex = new RegExp(`var ${variableName} = \\[([\\s\\S]*?)];`, 'gm'),
      result = regex.exec(body);
    try {
      if (result && result[0]) {
        // tslint:disable-next-line:no-eval direct-eval
        return eval(result[0]
          .replace('var ' + variableName + ' =', '')
          .replace(/;$/g, ''));
      }
    } catch (e) {

    }
    return [];
  }

  private static getTotalCount(result: RegExpExecArray) {
    const totalCountRegex = /totalCount:[ ]{0,}[\d]{1,100},/gm;
    const totalCountResult = totalCountRegex.exec(result[1]);
    if (totalCountResult && totalCountResult.length) {
      return +totalCountResult[0]
        .replace(/totalCount:[ ]{0,}/g, '')
        .replace(/,$/g, '');
    }
    return undefined;
  }

  public static cleanName(name: string): string {
    return name.replace(/^[0-9]{0,1}/g, '');
  }

  static getLevel(body: string): number {
    const levelRegex = /Level:[ ]{0,}[\d]{1,100}/gm;
    const levelResultResult = levelRegex.exec(body);
    if (levelResultResult && levelResultResult[0]) {
      return +levelResultResult[0].replace(/Level:[ ]{1,}/, '');
    }
    return undefined;
  }

  private static getClassicPhaseFrom(body: string) {
    const phaseRegex = new RegExp(/Phase [0-9]{1,2}/g),
      phase = phaseRegex.exec(body);
    if (phase && phase[0]) {
      const p = phase[0].replace('Phase ', '');
      return +p;
    }
    return 0;
  }
}