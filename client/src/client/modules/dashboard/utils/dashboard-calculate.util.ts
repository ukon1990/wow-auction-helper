import {DashboardV2} from '../models/dashboard-v2.model';
import {AuctionItem} from '../../auction/models/auction-item.model';
import {ItemRule, Rule} from '../models/rule.model';
import {AuctionItemStat} from '../../../../../../api/src/utils/auction-processor.util';
import {ColumnDescription} from '../../table/models/column-description';
import {TargetValueEnum} from '../types/target-value.enum';
import {ConditionEnum} from '../types/condition.enum';
import {TextUtil} from '@ukon1990/js-utilities';
import {AuctionUtil} from '../../auction/utils/auction.util';

export class DashboardCalculateUtil {
  /**
   * TODO: One calculate per data type?
   * - auction items
   * - recipes
   * - Shuffles
   * - etc?
   */
  static calculate(board: DashboardV2, items: Map<number, AuctionItem>): DashboardV2 {
    const dataMap = new Map<string, any>();

    if (board.rules && board.rules.length) {
      items.forEach((item: AuctionItem) => {
        if (this.isFollowingTheRules(board.rules, item)) {
          const id = this.getId(item);
          dataMap.set(id, this.getResultObject(item, board.columns));
        }
      });
    }

    if (board.itemRules && board.itemRules.length) {
      board.itemRules.forEach((item: ItemRule) => {
        const id = this.getId(undefined, item);
        if (dataMap.has(id) && !this.isFollowingTheRules(board.rules, items.get(item.itemId))) {
          dataMap.delete(id);
        }
      });
    }

    board.data = [];
    dataMap.forEach(item => board.data.push(item));
    return board;
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
    console.log('validateRule', fromValue, toValue);
    switch (rule.targetValueType) {
      case TargetValueEnum.PERCENT:
        return this.comparePercent(rule, fromValue, toValue);
      case TargetValueEnum.NUMBER:
        return this.compareNumbers(rule, fromValue, toValue);
      case TargetValueEnum.TEXT:
        return this.compareText(rule, fromValue, toValue);
      default:
        return false;
    }
  }

  private static getValue(item: AuctionItem, field: String): any {
    let value;
    field.split('.')
      .forEach(key => {
        if (!value && item[key]) {
          value = item[key];
        } else if (value && value[key]) {
          value = value[key];
        }
      });
    return value;
  }

  private static getResultObject(item: AuctionItem, columns: ColumnDescription[]) {
    const obj = {};
    columns.forEach(column =>
      this.getValueForColumn(item, column, obj));
    return obj;
  }

  private static getValueForColumn(item: AuctionItem, column: ColumnDescription, obj: {}) {
    if (item[column.key] !== undefined) {
      obj[column.key] = item[column.key];
    } else {
      obj[column.key] = 'TODO!';
    }
  }

  /**
   * Does not require a compare to x field (toField) property in rules
   * @param rule
   * @param fromValue
   * @param toValue
   */
  private static compareNumbers(rule: Rule, fromValue: any, toValue: any) {
    const value: number = (toValue || rule.toValue);
    console.log('compareNumbers', rule, fromValue, value);
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
    console.log('comparePercent', fromValue / toValue);
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
}
