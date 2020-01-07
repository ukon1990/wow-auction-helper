import * as lua from 'luaparse';
import {SharedService} from '../../services/shared.service';
import {ErrorReport} from '../error-report.util';
import {ObjectUtil} from '@ukon1990/js-utilities';
import {BehaviorSubject} from 'rxjs';
import {InventoryUtil} from './inventory.util';
import {Report} from '../report.util';
import {ProfitSummary} from '../../modules/tsm/models/profit-summary.model';

export class TSMCSV {
  characterGuilds?: any;
  csvCancelled?: any[];
  csvExpired?: any[];
  csvExpense?: any[];
  csvSales?: any[];
  csvIncome?: any[];
  csvBuys?: any[];
  profitSummary?: any;
  inventory?: object;
  inventoryMap?: object;
}

export class TsmLuaUtil {
  static events: BehaviorSubject<TSMCSV> = new BehaviorSubject(undefined);

  convertList(input: any): object {
    let result = {};
    try {
      result = this.processLuaData(input);

      InventoryUtil.organize(result);

      this.getUserProfits(result as TSMCSV);

      Object.keys(result)
        .forEach(key =>
          SharedService.tsmAddonData[key] = result[key]);

      Report.debug('Imported TSM history', result);
    } catch (error) {
      ErrorReport.sendError('TsmLuaUtil.convertList', error);
    }
    TsmLuaUtil.events.next(result);
    return result;
  }


  public processLuaData(input: any) {
    const result = {};
    const fields = lua.parse(input).body[0].init[0].fields;

    fields.forEach(field => {
      const fRes = this.convertField(field);
      if (!fRes) {
        return;
      }

      if (fRes.character && fRes.character.realm) {
        this.addRealmBoundData(fRes, result, field);

      } else {
        if (fRes.type === undefined || fRes.type === 'undefined') {
        } else {
          result[fRes.type] = fRes.data;
        }
      }
    });
    return result;
  }

  private addRealmBoundData(fRes, result, field) {
    try {
      if (!result[fRes.type]) {
        result[fRes.type] = {};
      }

      if (fRes.character.name) {
        if (!result[fRes.type][fRes.character.realm]) {
          result[fRes.type][fRes.character.realm] = [];
        }

        result[fRes.type][fRes.character.realm][fRes.character.name] = fRes.data;

        this.summerizeData(result, fRes);

        if (Object.keys(result[fRes.type][fRes.character.realm][fRes.character.name]).length === 0) {
          // Report.debug('Field missing data', [fRes, field]);
        }

      } else {
        result[fRes.type][fRes.character.realm] = fRes.data;
      }
    } catch (error) {
      ErrorReport.sendError('TsmLuaUtil.addRealmBoundData', error);
    }
  }

  private summerizeData(result, fRes) {
    try {
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
    } catch (error) {
      ErrorReport.sendError('TsmLuaUtil.summerizeData', error);
    }
  }

  private convertField(field: any): any {
    try {
      const {character, type, result} = this.getCharacterDataForField(field);

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
    } catch (error) {
      ErrorReport.sendError('TsmLuaUtil.convertField', error);
      return undefined;
    }
  }

  private getCharacterDataForField(field: any) {
    const keys = field.key.value.split('@');
    const character = this.splitCharacterData(keys[1]),
      type = keys[3];
    const result = {
      type: type,
      character,
      data: undefined
    };
    return {character, type, result};
  }

  private splitCharacterData(keys): { name?: string; faction?: number; realm: string; } {

    try {
      if (keys) {
        const split = keys.split(' - ');
        if (split.length === 1) {
          return {realm: split[0]};
        }

        if (split.length === 2) {
          return {
            faction: this.factionStringToId(split[0]),
            realm: split[1]
          };
        }

        return {
          name: split[0],
          faction: this.factionStringToId(split[1]),
          realm: split[2]
        };
      }
    } catch (error) {
      ErrorReport.sendError('TsmLuaUtil.splitCharacterData', error);
    }

    return undefined;
  }

  private factionStringToId(name: string) {
    return name === 'Alliance' ? 0 : 1;
  }

  private handleTable(field: any, character: any) {
    let result = {};

    try {
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
    } catch (error) {
      ErrorReport.sendError('TsmLuaUtil.handleTable', error);
    }
    return result;
  }

  private handleTableKey(column, character: any): any {
    try {
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

            if (character && character.faction !== undefined) {
              obj['faction'] = character.faction;
            }

            if (SharedService.items[obj.id]) {
              obj['name'] = SharedService.items[obj.id].name;
            }

            return obj;
          }
      }
    } catch (error) {
      ErrorReport.sendError('TsmLuaUtil.handleTableKey', error);
    }
  }

  private handleKey(value) {
    if (!value || !value.split) {
      return value;
    }

    try {
      const tmp = value.split(':');
      if (tmp.length > 0) {
        if (isNaN(+tmp[1])) {
          return value;
        }
        return +tmp[1];
      }
    } catch (error) {
      ErrorReport.sendError('TsmLuaUtil.handleKey', error);
    }

    return value;
  }

  private getUserProfits(result: TSMCSV) {
    try {
      const characters = result.characterGuilds;
      result.profitSummary = {};

      Object.keys(result.csvCancelled).forEach(realm => {
        result.profitSummary[realm] = new ProfitSummary(realm, characters);

        result.csvExpired[realm].forEach(row => {
          this.addUpProfits(result.profitSummary[realm], row, 'expired');
        });

        result.csvCancelled[realm].forEach(row => {
          this.addUpProfits(result.profitSummary[realm], row, 'cancelled');
        });

        result.csvBuys[realm].forEach(row => {
          this.addUpProfits(result.profitSummary[realm], row, 'purchases');
        });

        result.csvExpense[realm].forEach(row => {
          this.addUpProfits(result.profitSummary[realm], row, 'expenses');
        });

        result.csvIncome[realm].forEach(row => {
          this.addUpProfits(result.profitSummary[realm], row, 'income');
        });

        result.csvSales[realm].forEach(row => {
          this.addUpProfits(result.profitSummary[realm], row, 'sales');
        });

        if (this.isCurrentRealm(realm)) {
          result.profitSummary[realm].setSaleRates();
        }

        this.setAndSortItemList(result.profitSummary[realm], 'expired');
        this.setAndSortItemList(result.profitSummary[realm], 'cancelled');
        this.setAndSortItemList(result.profitSummary[realm], 'purchases');
        this.setAndSortItemList(result.profitSummary[realm], 'sales');
      });
    } catch (error) {
      ErrorReport.sendError('TsmLuaUtil.addItemToInventory', error);
    }
  }

  private isCurrentRealm(realm: string) {
    const r = SharedService.realms[SharedService.user.realm];
    if (!r) {
      return false;
    }
    return realm === r.name;
  }

  private addUpProfits(profitSummary: ProfitSummary, row, type: string) {
    profitSummary.past24Hours.add(row, type);
    profitSummary.past7Days.add(row, type);
    profitSummary.past14Days.add(row, type);
    profitSummary.past30Days.add(row, type);
    profitSummary.past90Days.add(row, type);
    profitSummary.total.add(row, type);
  }

  private setAndSortItemList(profitSummary: ProfitSummary, type: string) {
    profitSummary.past24Hours[type].setAndSortItemList();
    profitSummary.past7Days[type].setAndSortItemList();
    profitSummary.past14Days[type].setAndSortItemList();
    profitSummary.past30Days[type].setAndSortItemList();
    profitSummary.past90Days[type].setAndSortItemList();
    profitSummary.total[type].setAndSortItemList();
  }
}
