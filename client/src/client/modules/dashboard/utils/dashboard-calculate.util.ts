import {DashboardV2} from '../models/dashboard-v2.model';
import {AuctionItem} from '../../auction/models/auction-item.model';
import {ItemRule, Rule} from '../models/rule.model';
import {AuctionItemStat} from '../../../../../../api/src/utils/auction-processor.util';
import {ColumnDescription} from '../../table/models/column-description';
import {TargetValueEnum} from '../types/target-value.enum';
import {ConditionEnum} from '../types/condition.enum';
import {TextUtil} from '@ukon1990/js-utilities';
import {AuctionUtil} from '../../auction/utils/auction.util';
import {CraftingService} from '../../../services/crafting.service';
import {NpcService} from '../../npc/services/npc.service';
import {SharedService} from '../../../services/shared.service';
import {ItemService} from '../../../services/item.service';
import {Sorter} from '../../../models/sorter';

export class DashboardCalculateUtil {
  static setItemSources(items: Map<string, AuctionItem>): void {
    items.forEach(item => {
      item.source.recipe.all = CraftingService.itemRecipeMap.value.get(item.itemID);
      item.source.recipe.materialFor = CraftingService.reagentRecipeMap.value.get(item.itemID);
      try {
        item.source.recipe.known = CraftingService.itemRecipeMapPerKnown.value.get(item.itemID);
      } catch (error) {
        console.error(error);
      }

      item.source.npc = NpcService.itemNpcMap.value.get(item.itemID);
      item.source.tradeVendor = SharedService.tradeVendorItemMap[item.itemID];
      item.item = ItemService.mapped.value.get(item.itemID);
    });
  }

  static calculate(board: DashboardV2, items: Map<string, AuctionItem>): DashboardV2 {
    const dataMap = new Map<string, any>();
    if (board.onlyItemsWithRules) {
      this.addOnlyIncludedInItemRules(board, items, dataMap);
    } else {
      this.addMatchingBoardRules(board, items, dataMap);
      this.addMatchingItemRules(board, dataMap, items);
    }

    console.log(board);

    this.assignAndSortDataToBoard(dataMap, board);
    return board;
  }

  private static assignAndSortDataToBoard(dataMap: Map<string, any>, board: DashboardV2) {
    const data = [];
    dataMap.forEach(item =>
      data.push(item));

    if (board.sortRule) {
      const sorter = new Sorter();
      sorter.addKey(board.sortRule.field, undefined, board.sortRule.sortDesc);
      sorter.sort(data);
    }

    board.data = data;
  }

  private static addOnlyIncludedInItemRules(board: DashboardV2, items: Map<string, AuctionItem>, dataMap: Map<string, any>) {
    if (board.itemRules && board.itemRules.length) {
      board.itemRules.forEach((rule: ItemRule) => {
        const id = this.getId(undefined, rule);
        const item = items.get('' + rule.itemId);
        if (this.isFollowingTheRules(board.rules, item) &&
          this.isFollowingTheRules(rule.rules, items.get('' + rule.itemId))) {
          dataMap.set(id, this.getResultObject(item, board.columns));
        }
      });
    }
  }

  private static addMatchingBoardRules(board: DashboardV2, items: Map<string, AuctionItem>, dataMap: Map<string, any>) {
    if ((board.rules.length || board.itemRules && board.itemRules.length)) {
      items.forEach((item: AuctionItem) => {
        if (this.isFollowingTheRules(board.rules, item)) {
          const id = this.getId(item);
          dataMap.set(id, this.getResultObject(item, board.columns));
        }
      });
    }
  }

  private static addMatchingItemRules(board: DashboardV2, dataMap: Map<string, any>, items: Map<string, AuctionItem>) {
    if (board.itemRules && board.itemRules.length) {
      board.itemRules.forEach((item: ItemRule) => {
        const id = this.getId(undefined, item);
        if (dataMap.has(id) && !this.isFollowingTheRules(item.rules, items.get('' + item.itemId))) {
          dataMap.delete(id);
        }
      });
    }
  }

  private static isFollowingTheRules(rules: Rule[], item: AuctionItem) {
    for (let i = 0, length = rules.length; i < length; i++) {
      if (!this.validateRule(rules[i], item)) {
        return false;
      }
    }
    return true;
  }

  private static validateRule(rule: Rule, item: AuctionItem): boolean {
    const fromValue = this.getValue(item, rule.field);
    const toValue = this.getValue(item, rule.toField);
    switch (rule.targetValueType) {
      case TargetValueEnum.PERCENT:
        return this.comparePercent(rule, fromValue, toValue);
      case TargetValueEnum.GOLD:
      case TargetValueEnum.NUMBER:
        return this.compareNumbers(rule, fromValue, toValue);
      case TargetValueEnum.TEXT:
        return this.compareText(rule, fromValue, toValue);
      default:
        return false;
    }
  }

  private static getValue(item: AuctionItem, field: string): any {
    let value;
    if (!field) {
      return value;
    }
    value = this.getValueFromField(field, item);
    return value;
  }

  private static getValueFromField(field: string, item: AuctionItem) {
    const resultValues = [];
    const regex = /[*\-\/+]/gi;
    const mathExpressions = regex.exec(field);
    field.split(regex)
      .forEach((fieldPath, index) => {
        let value;
        fieldPath.split('.')
          .forEach(key => {
            if (!value && item[key]) {
              value = item[key];
            } else if (value) {
              value = value[key];
            } else {
              value = 0;
            }
          });
        resultValues.push(value);
      });
    return this.calculateField(resultValues, mathExpressions);
  }

  private static getResultObject(item: AuctionItem, columns: ColumnDescription[]) {
    const obj = {
      id: item.itemID,
      bonusIds: item.bonusIds,
      petSpeciesId: item.petSpeciesId,
      recipeId: item.source.recipe.known
    };

    columns.forEach(column => {
      obj[column.key] = this.getValue(item, column.key);
      if (column.options && column.options.idName) {
        obj[column.options.idName] = this.getValue(item, column.options.idName);
      }
    });
    return obj;
  }

  /**
   * Does not require a compare to x field (toField) property in rules
   * @param rule
   * @param fromValue
   * @param toValue
   */
  private static compareNumbers(rule: Rule, fromValue: any, toValue: any) {
    const value: number = (toValue || rule.toValue);
    switch (rule.condition) {
      case ConditionEnum.GREATER_THAN:
        return fromValue > value;
      case ConditionEnum.GREATER_THAN_OR_EQUAL_TO:
        return fromValue >= value;
      case ConditionEnum.EQUAL_TO:
        return fromValue === value;
      case ConditionEnum.LESS_THAN_OR_EQUAL_TO:
        return fromValue <= value;
      case ConditionEnum.LESS_THAN:
        return fromValue < value;
      case ConditionEnum.IS_NOT:
        return fromValue !== value;
      default:
        return false;
    }
  }

  /**
   * Does require a compare to x field (toField) property in rules
   * @param rule
   * @param fromValue
   * @param toValue
   */
  private static comparePercent(rule: Rule, fromValue: number, toValue: number) {
    return this.compareNumbers(rule, fromValue / toValue, rule.toValue);
  }

  private static compareText(rule: Rule, fromValue: string, toValue: string) {
    const value: string = (toValue || rule.toValue) + '';
    switch (rule.condition) {
      case ConditionEnum.CONTAINS:
        return TextUtil.contains(fromValue, value);
      case ConditionEnum.DOES_NOT_CONTAIN:
        return !TextUtil.contains(fromValue, value);
      case ConditionEnum.EQUAL_TO:
        return TextUtil.isEqualIgnoreCase(fromValue, value);
      case ConditionEnum.IS_NOT:
        return fromValue !== value;
      default:
        return false;
    }
  }

  private static getId(item: AuctionItem, itemRule?: ItemRule) {
    if ((item || itemRule).petSpeciesId) {
      return AuctionUtil.getPetId(item.auctions[0]);
    }
    return ((item ? item.itemID : undefined) || itemRule.itemId) +
      AuctionItemStat.bonusIdRaw((item || itemRule).bonusIds, false);
  }

  private static calculateField(resultValues: any[], mathExpressions: RegExpExecArray) {
    if (resultValues.length < 2) {
      return resultValues[0];
    }
    let value;
    resultValues.forEach((v, index) => {
      if (index === 0) {
        value = v;
        return;
      }
      switch (mathExpressions[index - 1]) {
        case '/':
          value /= v;
          break;
        case '*':
          value *= v;
          break;
        case '+':
          value += v;
          break;
        case '-':
          value -= v;
          break;
      }
    });
    return value;
  }
}
