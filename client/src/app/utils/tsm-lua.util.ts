import * as lua from 'luaparse';
import {SharedService} from '../services/shared.service';
import {ObjectUtil} from './object.util';
import {ItemInventory} from '../models/item/item';

class TSMCSV {
  characterGuilds: any;
  csvExpense: any[];
  csvSales: any[];
  csvIncome: any[];
  csvBuys: any[];
  profitSummary: any;
}

export class TsmLuaUtil {
  public static calculateInventory(inventory): void {
    Object.keys(inventory).forEach(realm => {
      inventory[realm].forEach(item => {
        const ahItem = SharedService.auctionItemsMap[item.id];
        if (ahItem) {
          item.buyout = ahItem.buyout;
          item.sumBuyout = ahItem.buyout * item.quantity;
        } else {
          item.buyout = 0;
          item.sumBuyout = 0;
        }

        if (SharedService.items[item.id]) {
          SharedService.items[item.id].inventory = item;
        }
      });
    });
  }

  convertList(input: any): object {
    const fields = lua.parse(input).body[0].init[0].fields;
    const result = {};

    fields.forEach(field => {
      const fRes = this.convertField(field);
      if (fRes.character && fRes.character.realm) {
        this.addRealmBoundData(fRes, result);

      } else {
        if (fRes.type === undefined || fRes.type === 'undefined') {
        } else {
          result[fRes.type] = fRes.data;
        }
      }
    });

    this.setInventory(result);

    this.getUserProfits(result as TSMCSV);

    Object.keys(result)
      .forEach(key =>
        SharedService.tsmAddonData[key] = result[key]);
    return result;
  }


  private addRealmBoundData(fRes, result) {
    if (!result[fRes.type]) {
      result[fRes.type] = {};
    }

    if (fRes.character.name) {
      if (!result[fRes.type][fRes.character.realm]) {
        result[fRes.type][fRes.character.realm] = [];
      }

      result[fRes.type][fRes.character.realm][fRes.character.name] = fRes.data;

      this.summerizeData(result, fRes);

    } else {
      result[fRes.type][fRes.character.realm] = fRes.data;
    }
  }

  private summerizeData(result, fRes) {
    if (!result[fRes.type][fRes.character.realm]['All']) {
      result[fRes.type][fRes.character.realm]['All'] = [];
    }

    if (ObjectUtil.isObject(fRes.data)) {
      Object.keys(fRes.data)
        .forEach(key => {
          fRes.data[key].character = fRes.character.name;
          result[fRes.type][fRes.character.realm]['All'].push(fRes.data[key]);
        });
    } else {
      fRes.data.forEach(d => {
        d.character = fRes.character.name;
        result[fRes.type][fRes.character.realm]['All'].push(d);
      });
    }
  }

  private convertField(field: any): any {
    const keys = field.key.value.split('@');
    const character = this.splitCharacterData(keys[1]),
      type = keys[3];
    const result = {
      type: type,
      character: character,
      data: undefined
    };

    switch (field.value.type) {
      case 'TableConstructorExpression':
        result.data = this.handleTable(field, character);
        break;
      case 'NumericLiteral':
      case 'BooleanLiteral':
        result.data = field.value.value;
        break;
      case 'StringLiteral' :
        const d = field.value.value.split('\n');
        if (d.length > 0) {
          result.data = [];
          const headers = d[0].split(',');
          for (let i = 1, l = d.length; i < l; i++) {
            const obj = {};
            const columns = d[i].split(',');
            columns.forEach((column, index) => {
              obj[headers[index]] = +column;
              if (!isNaN(+column)) {
                if (headers[index] === 'time') {
                  obj[headers[index]] *= 1000;
                } else if (headers[index] === 'minute') {
                  obj[headers[index]] *= 60000;
                }

              } else if (headers[index] === 'itemString') {
                const tmp = column.split(':');
                delete obj[headers[index]];
                obj['id'] = +tmp[1];
                obj['bonusIds'] = tmp.slice(2, tmp.length - 1);

                if (SharedService.items[+tmp[1]]) {
                  obj['name'] = SharedService.items[+tmp[1]].name;
                }
              } else {
                obj[headers[index]] = column;
              }
            });
            obj['ownerRealm'] = character.realm;
            result.data.push(obj);
          }
        } else {
          result.data = field.value.value;
        }
        break;
      default:
        result.data = field.value;
    }

    return result;
  }

  private splitCharacterData(keys): { name?: string; faction?: string; realm: string; } {
    if (keys) {
      const split = keys.split(' - ');
      if (split.length === 1) {
        return {realm: split[0]};
      }

      if (split.length === 2) {
        return {
          faction: split[0],
          realm: split[1]
        };
      }

      return {
        name: split[0],
        faction: split[1],
        realm: split[2]
      };
    }
    return undefined;
  }

  private handleTable(field: any, character: any) {
    let result = {};
    if (field.value && field.value.fields) {
      field.value.fields.forEach(column => {
        switch (column.type) {
          case 'TableValue':
            const obj = this.handleTable(column.value, character);
            if (obj) {
              result[obj['id']] = obj['value'];
            }
            break;
          case 'TableKey':
            const o = this.handleTableKey(column, character);
            const id = o.id ? o.id : column.key.value;
            result[id] = o;
            break;
          default:
            console.log(column.type, column);
            break;
        }
      });
    } else {
      // console.log('handleTable', result, type, field);
      result = field.value;
    }
    return result;
  }

  private handleTableKey(column, character: any): any {
    switch (column.type) {
      case 'TableKey':
        if (column.value.fields) {
          const list = [];
          column.value.fields.forEach(field =>
            list.push(field));
          return list;
        } else {
          const obj = {
            id: this.handleKey(column.key.value),
            value: column.value.value
          };

          if (character && character.name) {
            obj['character'] = character.name;
          }

          if (SharedService.items[obj.id]) {
            obj['name'] = SharedService.items[obj.id].name;
          }

          return obj;
        }
    }
  }

  private handleKey(value) {
    const tmp = value.split(':');
    if (tmp.length > 0) {
      if (isNaN(+tmp[1])) {
        return value;
      }
      return +tmp[1];
    }

    return value;
  }

  private setInventory(tsmData) {
    const map = {};
    Object.keys(tsmData.bankQuantity)
      .forEach(realm =>
        tsmData.bankQuantity[realm].All.forEach(item =>
          this.addItemToInventory(item, map, 'Bank', realm)));


    Object.keys(tsmData.reagentBankQuantity)
      .forEach(realm =>
        tsmData.reagentBankQuantity[realm].All.forEach(item =>
          this.addItemToInventory(item, map, 'Reagent bank', realm)));

    Object.keys(tsmData.bagQuantity)
      .forEach(realm =>
        tsmData.bagQuantity[realm].All.forEach(item =>
          this.addItemToInventory(item, map, 'Bags', realm)));

    tsmData.inventoryMap = map;
    tsmData.inventory = {};
    Object.keys(map).forEach(realm => {
      tsmData.inventory[realm] = [];

      Object.keys(map[realm]).forEach(id =>
        tsmData.inventory[realm].push(map[realm][id]));

      tsmData.inventory[realm].sort((a: ItemInventory, b: ItemInventory) =>
        b.quantity > a.quantity);
    });
    TsmLuaUtil.calculateInventory(tsmData.inventory);
  }

  private addItemToInventory(item, map, storedIn: string, realm: string): void {
    if (!map[realm]) {
      map[realm] = {};
    }

    if (!map[realm][item.id]) {
      map[realm][item.id] = new ItemInventory(item, storedIn);
    } else {
      map[realm][item.id].addCharacter(item, storedIn);
    }
  }

  private getUserProfits(result: TSMCSV) {
    const characters = result.characterGuilds;
    result.profitSummary = {};
    console.log('csv', result);

    Object.keys(result.csvExpense).forEach(realm => {
      result.profitSummary[realm] = {
        past24Hours: new UserProfit(1, characters[realm]),
        past7Days: new UserProfit(7, characters[realm]),
        past30Days: new UserProfit(30, characters[realm]),
        past90Days: new UserProfit(90, characters[realm]),
        total: new UserProfit(undefined, characters[realm])
      };

      result.csvBuys[realm].forEach(row => {
        this.addUpProfits(result.profitSummary[realm], row, 'purchases');
      });

      result.csvExpense[realm].forEach(row => {
        this.addUpProfits(result.profitSummary[realm], row, 'expense');
      });

      result.csvIncome[realm].forEach(row => {
        this.addUpProfits(result.profitSummary[realm], row, 'income');
      });

      result.csvSales[realm].forEach(row => {
        this.addUpProfits(result.profitSummary[realm], row, 'sales');
      });
    });
  }

  private addUpProfits(profitSummary, row, type: string) {
    profitSummary.past24Hours.add(row, type);
    profitSummary.past7Days.add(row, type);
    profitSummary.past30Days.add(row, type);
    profitSummary.past90Days.add(row, type);
    profitSummary.total.add(row, type);
  }
}

export class UserProfit {
  expenses: UserProfitValue = new UserProfitValue();
  sales: UserProfitValue = new UserProfitValue();
  income: UserProfitValue = new UserProfitValue();
  purchases: UserProfitValue = new UserProfitValue();
  profit = 0;

  constructor(public daysSince: number, private characters: any) {
  }

  add(value: { amount: number; time: number; price: number; }, type: string): void {
    const thenVsNow = new Date().getTime() - value.time;
    if (this.isTimeMatch(thenVsNow) && !this.excludeUserCharacters(value)) {
      switch (type) {
        case 'expense':
          this.expenses.add(value);
          this.profit -= value.amount;
          break;
        case 'sales':
          this.sales.add(value);
          this.profit += value.price;
          break;
        case 'income':
          this.income.add(value);
          this.profit += value.amount;
          break;
        case 'purchases':
          this.purchases.add(value);
          this.profit -= value.price;
          break;
      }
    }
  }

  private isTimeMatch(thenVsNow) {
    return this.getDaysFromMS(thenVsNow) <= this.daysSince || !this.daysSince;
  }

  excludeUserCharacters(v: any): boolean {
    if (!this.characters) {
      return false;
    }
    return this.characters[v.player] && this.characters[v.otherPlayer];
  }

  getDaysFromMS(ms: number): number {
    const day = 86400000;
    return ms / day;
  }
}

export class UserProfitValue {
  quantity = 0;
  copper = 0;

  add(value): void {
    if (value.quantity) {
      this.quantity += value.quantity;
    } else {
      this.quantity += 1;
    }

    this.copper += value.amount || value.price;
  }
}
