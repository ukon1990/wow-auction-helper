import {
  WoWHead,
  WoWHeadSoldBy,
  WoWHeadDroppedBy,
  WoWHeadCurrencyFor,
  WoWHeadContainedInItem,
  WoWHeadContainedInObject,
  WoWHeadProspectedFrom
} from '../models/item/wowhead';
import { Item } from '../models/item/item';

export class WoWHeadUtil {

  static pctStackRegex = /,["]{0,1}pctstack["]{0,1}:{([\s\S]*?)}/g;
  // .replace(/,["]{0,1}pctstack["]{0,1}:{([\s\S]*?)}/g, 'tiss');
  public static setValuesAll(body: string): any {
    const wh = new WoWHead();
    wh.expansionId = WoWHeadUtil.getExpansion(body);
    // wh.createdBy = undefined;
    wh.containedInItem = WoWHeadUtil.getContainedInItem(body);
    wh.containedInObject = WoWHeadUtil.getContainedInObject(body); // contained-in-object
    wh.currencyFor = WoWHeadUtil.getCurrencyFor(body);
    // wh.objectiveOf = undefined;
    wh.soldBy = WoWHeadUtil.getSoldBy(body);
    wh.droppedBy = WoWHeadUtil.getDroppedBy(body);
    wh.prospectedFrom = WoWHeadUtil.getProspectedFrom(body);
    wh.milledFrom = WoWHeadUtil.getMilledFrom(body);
    // return body;
    return wh;
  }

  public static getExpansion(body: string): number {
    const expansionRegex = new RegExp(/Added in patch [0-9]{1,2}\.[0-9]{1,2}/g),
      addedIn = expansionRegex.exec(body);
    if (addedIn && addedIn[0]) {
      return parseInt(addedIn[0].replace('Added in patch ', '').split('.')[0], 10) - 1;
    }
    return 0;
  }

  public static getMilledFrom(body: string): WoWHeadProspectedFrom[] {
    const droppedByRegex = new RegExp(/new Listview\({template: 'item', id: 'milled-from',([\s\S]*?)}\);/g);
    const dbrx = new RegExp(/data\: ([\s\S]*?)}\);/g);
    const droppedByResult = droppedByRegex.exec(body);
    if (!droppedByResult) {
      return [];
    }

    const regexResult = dbrx.exec(
      droppedByResult[0])[0]
      .replace('data: ', '')
      .replace('});', '')
      .replace(/,count:/g, ',\"count\":')
      .replace(/,outof:/g, ',\"outof\":')
      .replace(/,personal_loot:/g, ',\"personal_loot\":')
      .replace(/,stack:/g, ',\"stack\":')
      .replace(/pctstack:/gi, '"pctstack":')
      .replace(/([0-9]{1,200}:)/gi, '"$1":')
      .replace(/'{/g, '{')
      .replace(/}'/g, '}');
    // regexResult = regexResult.replace(WoWHeadUtil.pctStackRegex, '');

    const droppedBy = JSON.parse(regexResult);

    droppedBy.forEach((item: WoWHeadProspectedFrom) => {
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

    return droppedBy;
  }

  public static getProspectedFrom(body: string): WoWHeadProspectedFrom[] {
    const droppedByRegex = new RegExp(/new Listview\({template: 'item', id: 'prospected-from',([\s\S]*?)}\);/g);
    const dbrx = new RegExp(/data\: ([\s\S]*?)}\);/g);
    const droppedByResult = droppedByRegex.exec(body);
    if (!droppedByResult) {
      return [];
    }

    const regexResult = dbrx.exec(
      droppedByResult[0])[0]
      .replace('data: ', '')
      .replace('});', '')
      .replace(/,count:/g, ',\"count\":')
      .replace(/,outof:/g, ',\"outof\":')
      .replace(/,personal_loot:/g, ',\"personal_loot\":')
      .replace(/,stack:/g, ',\"stack\":')
      .replace(/pctstack:/gi, '"pctstack":')
      .replace(/([0-9]{1,200}:)/gi, '"$1":')
      .replace(/'{/g, '{')
      .replace(/}'/g, '}');
    // regexResult = regexResult.replace(WoWHeadUtil.pctStackRegex, '');

    const droppedBy = JSON.parse(regexResult);

    droppedBy.forEach((item: WoWHeadProspectedFrom) => {
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

    return droppedBy;
  }

  public static cleanUpItemString(str: string): string {
    return str
      .replace('data: ', '')
      .replace('});', '')
      .replace(/stock:/g, '\"stock\":')
      .replace(/cost:/g, '\"cost\":')
      .replace(/stack:/g, '\"stack\":')
      .replace(/,count:/g, ',\"count\":')
      .replace(/,outof:/g, ',\"outof\":')
      .replace(/,personal_loot:/g, ',\"personal_loot\":')
      .replace(/,maxLevel:/g, ',\"maxLevel\":')
      .replace(/pctstack:/gi, '"pctstack":')
      .replace(/([0-9]{1,200}:)/gi, '"$1":')
      .replace(/'{/g, '{')
      .replace(/}'/g, '}');
  }

  public static getDroppedBy (body: string): WoWHeadDroppedBy[] {
    const droppedByRegex = new RegExp(/new Listview\({template: 'npc', id: 'dropped-by',([\s\S]*?)}\);/g);
    const dbrx = new RegExp(/data\: ([\s\S]*?)}\);/g);
    const droppedByResult = droppedByRegex.exec(body);
    if (!droppedByResult) {
      return [];
    }

    let regexResult = dbrx.exec(
      droppedByResult[0])[0]
      .replace('data: ', '')
      .replace('});', '')
      .replace(/,count:/g, ',\"count\":')
      .replace(/,outof:/g, ',\"outof\":')
      .replace(/,personal_loot:/g, ',\"personal_loot\":')
      .replace(/,maxLevel:/g, ',\"maxLevel\":')
      .replace(/pctstack:/gi, '"pctstack":')
      .replace(/([0-9]{1,200}:)/gi, '"$1":')
      .replace(/'{/g, '{')
      .replace(/}'/g, '}');
    regexResult = regexResult.replace(WoWHeadUtil.pctStackRegex, '');

    const droppedBy = JSON.parse(regexResult);

    droppedBy.forEach((npc: WoWHeadDroppedBy) => {
      npc.dropChance = npc.count / npc.outof;
      delete npc.pctstack;
      delete npc.personal_loot;
      delete npc.classification;
      npc.name = WoWHeadUtil.cleanName(npc.name);
    });

    return droppedBy;
  }

  public static getSoldBy(body: string): WoWHeadSoldBy[] {
    const soldByRegex = new RegExp(/new Listview\({template: 'npc', id: 'sold-by',([\s\S]*?)}\);/g);
    const dbrx = new RegExp(/data\: ([\s\S]*?)}\);/g);
    const soldByResult = soldByRegex.exec(body);
    if (!soldByResult) {
      return [];
    }
    const soldByString = dbrx.exec(
      soldByResult[0])[0]
      .replace(WoWHeadUtil.pctStackRegex, '')
      .replace('data: ', '')
      .replace('});', '')
      .replace(/stock:/g, '\"stock\":')
      .replace(/cost:/g, '\"cost\":')
      .replace(/stack:/g, '\"stack\":')
      .replace(/'{/g, '{')
      .replace(/}'/g, '}');
      const soldBy = JSON.parse(soldByString) as WoWHeadSoldBy[];
      // const currency = WoWHeadUtil.getCurrency(body);
      if (soldBy) {
        soldBy.forEach((sBy: WoWHeadSoldBy) => {
          WoWHeadUtil.setCurrency(sBy);
          delete sBy.classification;
          delete sBy.type;
          sBy.name = WoWHeadUtil.cleanName(sBy.name);
        });
      }
    return soldBy;
  }

  public static setCurrency(source: any): void {
    if ((source.cost as Array<any>).length > 0 && source.cost[2] && source.cost[2][0]) {
      source.currency = source.cost[2][0][0];
      source.cost = source.cost[2][0][1];
    } else {
      source.cost = source.cost[0];
    }
  }

  public static getCurrencyFor(body: string): WoWHeadCurrencyFor[] {
    // currency-for
    const currencyForRegex = new RegExp(/new Listview\({template: 'item', id: 'currency-for',([\s\S]*?)}\);/g);
    const dbrx = new RegExp(/data\: ([\s\S]*?)}\);/g);
    const currencyForResult = currencyForRegex.exec(body);
    if (!currencyForResult) {
      return [];
    }
    const currencyForString = dbrx.exec(
      currencyForResult[0])[0]
      .replace(WoWHeadUtil.pctStackRegex, '')
      .replace('data: ', '')
      .replace('});', '')
      .replace(/stock:/g, '\"stock\":')
      .replace(/cost:/g, '\"cost\":')
      .replace(/stack:/g, '\"stack\":')
      .replace(/'{/g, '{')
      .replace(/}'/g, '}');
    const currencyFor = JSON.parse(currencyForString);
    if (currencyFor) {
      currencyFor.forEach((item: WoWHeadCurrencyFor) => {
        WoWHeadUtil.setCurrency(item);
        delete item.classs;
        delete item.flags2;
        delete item.subclass;
        delete item.slot;
        delete item.skill;
        item.name = WoWHeadUtil.cleanName(item.name);
      });
    }
    return currencyFor;
  }

  public static getContainedInItem(body: string): WoWHeadContainedInItem[] {
    const droppedByRegex = new RegExp(/new Listview\({template: 'item', id: 'contained-in-item',([\s\S]*?)}\);/g),
      dbrx = new RegExp(/data\: ([\s\S]*?)}\);/g),
      droppedByResult = droppedByRegex.exec(body);
    if (!droppedByResult) {
      return [];
    }
    let str = dbrx.exec(
      droppedByResult[0])[0]
      .replace('data: ', '')
      .replace('});', '')
      .replace(/,count:/g, ',\"count\":')
      .replace(/,outof:/g, ',\"outof\":')
      .replace(/,personal_loot:/g, ',\"personal_loot\":')
      .replace(/,maxLevel:/g, ',\"maxLevel\":')
      .replace(/'{/g, '{')
      .replace(/}'/g, '}');

    str = str.replace(WoWHeadUtil.pctStackRegex, '');
    const items = JSON.parse(str);


    items.forEach((item: WoWHeadContainedInItem) => {
      item.dropChance = item.count / item.outof;
      delete item.classs;
      delete item.flags2;
      delete item.subclass;
      delete item.level;
      item.name = WoWHeadUtil.cleanName(item.name);
    });

    return items;
  }

  public static getContainedInObject(body: string): WoWHeadContainedInObject[] {
    const droppedByRegex = new RegExp(/new Listview\({template: 'object', id: 'contained-in-object',([\s\S]*?)}\);/g);
    const dbrx = new RegExp(/data\: ([\s\S]*?)}\);/g);
    const droppedByResult = droppedByRegex.exec(body);
    if (!droppedByResult) {
      return [];
    }
    let str = dbrx.exec(
      droppedByResult[0])[0]
      .replace('data: ', '')
      .replace('});', '')
      .replace(/,count:/g, ',\"count\":')
      .replace(/,outof:/g, ',\"outof\":')
      .replace(/,personal_loot:/g, ',\"personal_loot\":')
      .replace(/,maxLevel:/g, ',\"maxLevel\":')
      .replace(/'{/g, '{')
      .replace(/}'/g, '}');

    str = str.replace(WoWHeadUtil.pctStackRegex, '');
    const items = JSON.parse(str);


    items.forEach((item: WoWHeadContainedInObject) => {
      item.dropChance = item.count / item.outof;
      delete item.type;
      item.name = WoWHeadUtil.cleanName(item.name);
    });
    return items;
  }

  public static cleanName(name: string): string {
    return name.replace(/^[0-9]{0,1}/g, '');
  }
}