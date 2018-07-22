import { WoWHead } from '../models/item/wowhead';
import { Item } from '../models/item/item';

export class WoWHeadUtil {

  public static setValuesAll(body: string): any {
    const wh = new WoWHead();
    wh.expansionId = WoWHeadUtil.getExpansion(body);
    wh.createdBy = '';
    wh.containedIn = '';
    wh.currencyFor = '';
    wh.objectiveOf = '';
    wh.soldBy = WoWHeadUtil.getSoldBy(body);
    wh.droppedBy = WoWHeadUtil.getDroppedBy(body);
    //return body;
    return wh;
  }

  public static getExpansion(body: string) {
    const expansionRegex = new RegExp(/Added in patch [0-9]{1,2}\.[0-9]{1,2}/g),
      addedIn = expansionRegex.exec(body);
    if (addedIn && addedIn[0]) {
      return parseInt(addedIn[0].replace('Added in patch ', '').split('.')[0], 10) - 1;
    }
    return 0;
  }

  public static getDroppedBy (body: string): any {
    const droppedByRegex = new RegExp(/new Listview\({template: 'npc', id: 'dropped-by',([\s\S]*?)}\);/g);
    const dbrx = new RegExp(/data\: ([\s\S]*?)}\);/g);
    const droppedByResult = droppedByRegex.exec(body);
    if (!droppedByResult) {
      return [];
    }

    return dbrx.exec(
      droppedByResult[0])[0]
      .replace('data: ', '')
      .replace('});', '')
      .replace(/count/g, '\"count\"')
      .replace(/outof/g, '\"outof\"')
      .replace(/personal_loot/g, '\"personal_loot\"')
      .replace(/pctstack/g, '\"pctstack\"')
      .replace(/'{/g, '{')
      .replace(/}'/g, '}');
  }

  public static getSoldBy(body: string) {
    const soldByRegex = new RegExp(/new Listview\({template: 'npc', id: 'sold-by',([\s\S]*?)}\);/g);
    const dbrx = new RegExp(/data\: ([\s\S]*?)}\);/g);
    const soldByResult = soldByRegex.exec(body);
    if (!soldByResult) {
      return [];
    }
    const soldByString = dbrx.exec(
      soldByResult[0])[0]
      .replace('data: ', '')
      .replace('});', '')
      .replace(/stock/g, '\"stock\"')
      .replace(/cost/g, '\"cost\"')
      .replace(/'{/g, '{')
      .replace(/}'/g, '}');

    return JSON.parse(soldByString);
  }

  public static getCreatedBy(body: string) {}
}