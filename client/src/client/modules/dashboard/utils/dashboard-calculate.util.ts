import { DashboardV2 } from '../models/dashboard-v2.model';
import { AuctionItem } from '../../auction/models/auction-item.model';
import { ItemRule, Rule } from '../models/rule.model';
import { ColumnDescription } from '../../table/models/column-description';
import { TargetValueEnum } from '../types/target-value.enum';
import { ConditionEnum } from '../types/condition.enum';
import { EmptyUtil, TextUtil } from '@ukon1990/js-utilities';
import { AuctionUtil } from '../../auction/utils/auction.util';
import { Sorter } from '../../../models/sorter';
import { ErrorReport } from '../../../utils/error-report.util';
import { GoldPipe } from '../../util/pipes/gold.pipe';
import { AuctionItemStat } from '../../../../../../api/src/auction/models/auction-item-stat.model';

interface IdPaths {
  recipeId?: string;
  soldById?: string;
  droppedById?: string;
  zoneId?: string;
}

export class DashboardCalculateUtil {

  static calculate(board: DashboardV2, items: Map<string, AuctionItem>): DashboardV2 {
    if (board.isDisabled) {
      board.data = [];
      return board;
    }
    const paths: IdPaths = {
      recipeId: this.getIdParameterForName(board, 'recipe'),
      soldById: this.getIdParameterForName(board, 'soldBy'),
      droppedById: this.getIdParameterForName(board, 'dropped'),
      zoneId: this.getIdParameterForName(board, 'zone')
    };

    // TODO: Filter away TSM stuff temporarily
    try {
      const dataMap = new Map<string, any>();
      if (board.onlyItemsWithRules) {
        this.addOnlyIncludedInItemRules(board, items, dataMap, paths);
      } else {
        this.addMatchingBoardRules(board, items, dataMap, paths);
        this.addMatchingItemRules(board, dataMap, items);
      }
      this.assignAndSortDataToBoard(dataMap, board);

    } catch (error) {
      ErrorReport.sendError('DashboardCalculateUtil.calculate', error);
    }
    return board;
  }

  private static getIdParameterForName(board: DashboardV2, name: string) {
    let recipeIdKey;
    board.columns.forEach(column => {
      if (!recipeIdKey && TextUtil.contains(column.key, name)) {
        const { regex, expressions } = this.getMathRegex(column.key);
        const keys = column.key.split(regex)
          .filter(key => TextUtil.contains(key, name))[0];
        const parts = keys.split('.');
        const path: string[] = [];
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          path.push(part);
          if (TextUtil.contains(part, name)) {
            if (TextUtil.contains(parts[i + 1], '[')) {
              path.push(parts[i + 1]);
            }
            path.push(`id`);
            recipeIdKey = path.join('.');
            return recipeIdKey;
          }
        }
      }
    });
    return recipeIdKey;
  }

  private static assignAndSortDataToBoard(dataMap: Map<string, [any]>, board: DashboardV2) {
    let data = [];
    dataMap.forEach(item =>
      data = [...data, ...item]);

    if (board.sortRule) {
      const sorter = new Sorter();
      sorter.addKey(board.sortRule.field, undefined, board.sortRule.sortDesc);
      sorter.sort(data);
    }

    board.data = data;
  }

  private static addOnlyIncludedInItemRules(board: DashboardV2, items: Map<string, AuctionItem>, dataMap: Map<string, any>,
    paths: IdPaths) {
    if (board.itemRules && board.itemRules.length) {
      board.itemRules.forEach((itemRule: ItemRule) => {
        const id = this.getId(undefined, itemRule);
        const item = items.get('' + itemRule.itemId);
        const iterableKeyRules = [
          ...board.rules.filter(rule => this.ruleContainsIterable(rule)),
          ...itemRule.rules.filter(rule => this.ruleContainsIterable(rule))
        ];
        const nonIterableKeyRules = [
          ...board.rules.filter(rule => !this.ruleContainsIterable(rule)),
          ...itemRule.rules.filter(rule => !this.ruleContainsIterable(rule))
        ];
        const iterableFields = [
          ...board.columns.map(column => ({
            field: column.key, condition: null, targetValueType: null, isAlwaysValid: true
          })).filter(column =>
            this.ruleContainsIterable(column))
        ];

        if (item && !itemRule.rules.length && !board.rules.length && iterableFields.length) {
          if (item && this.isFollowingTheRules(nonIterableKeyRules, item)) {
            this.addMatchingForIterableFields(iterableFields, item, board, dataMap, id, paths, true);
          }
        } else if (iterableKeyRules.length > 0) {
          this.addMatchingForIterableFields(iterableKeyRules, item, board, dataMap, id, paths);
        } else if (item && this.isFollowingTheRules(board.rules, item) &&
          this.isFollowingTheRules(itemRule.rules, item)) {
          try {
            dataMap.set(id, [this.getResultObject(item, board.columns, paths)]);
          } catch (e) {
          }
        }
      });
    }
  }

  private static addMatchingBoardRules(
    board: DashboardV2,
    items: Map<string, AuctionItem>,
    dataMap: Map<string, any>,
    paths: IdPaths
  ) {
    if ((board.rules.length || (board.itemRules && board.itemRules.length))) {
      try {
        const iterableKeyRules = (board.rules || []).filter(rule => this.ruleContainsIterable(rule));
        const nonIterableKeyRules = (board.rules || []).filter(rule => !this.ruleContainsIterable(rule));

        items.forEach((item: AuctionItem) => {
          if (item && this.isFollowingTheRules(nonIterableKeyRules, item)) {
            const id = this.getId(item);
            if (iterableKeyRules.length > 0) {
              this.addMatchingForIterableFields(iterableKeyRules, item, board, dataMap, id, paths);
            } else {
              try {
                dataMap.set(id, [this.getResultObject(item, board.columns, paths)]);
              } catch (e) {
              }
            }
          }
        });
      } catch (e) {
        ErrorReport.sendError('DashboardCalculateUtil.addMatchingForIterableFields', e);
      }
    }
  }

  private static addMatchingForIterableFields(iterableKeyRules: Rule[], item: AuctionItem, board: DashboardV2,
    dataMap: Map<string, any>, id: string, paths: IdPaths, printLog: boolean = false) {
    const list = [];
    let arr: any[];
    const partialPath = [];
    let obj;
    this.getParamWithArrayIndicator(iterableKeyRules).split('.')
      .forEach(key => {
        partialPath.push(key);
        if (key.indexOf('[') === 0) {
          const arrKey = key.replace(/[\[\]]/gi, '');
          arr = obj ? obj[arrKey] : item ? item[arrKey] : undefined;

          if (arr) {
            arr.forEach((it, index) => {
              const childObject = this.getItemCopy(item);
              this.setValueAtPath(childObject, it, partialPath, index);
              if (this.isFollowingTheRules(iterableKeyRules, childObject)) {
                try {
                  list.push(this.getResultObject(childObject, board.columns, paths));
                } catch (e) {
                }
              }
            });
          }
        } else {
          if (obj) {
            obj = obj[key];
          } else {
            try {
              obj = item[key];
            } catch (error) {
            }
          }
        }
      });
    if (list.length) {
      dataMap.set(id, list);
    }
  }

  private static getItemCopy(item: AuctionItem): AuctionItem {
    return {
      ...item,
      source: {
        ...item.source,
        recipe: {
          known: item.source.recipe.known ?
            [...item.source.recipe.known] : [],
          all: item.source.recipe.all ?
            [...item.source.recipe.all] : [],
          materialFor: item.source.recipe.materialFor ?
            [...item.source.recipe.materialFor] : []
        },
        /*
        shuffle: {
          sourceIn: [...item.source.shuffle.sourceIn],
          targetIn: [...item.source.shuffle.targetIn]
        }
        */
      }
    };
  }

  private static getParamWithArrayIndicator(iterableKeyRules: Rule[]) {
    if (iterableKeyRules[0].field.indexOf('[') > -1) {
      const { regex: rx } = this.getMathRegex(iterableKeyRules[0].field);
      const sp = iterableKeyRules[0].field.split(rx);
      return sp.length > 1 ? sp[1] : sp[0];
    }
    const { regex } = this.getMathRegex(iterableKeyRules[0].toField);
    const split = iterableKeyRules[0].toField.split(regex);
    return split.length > 1 ? split[1] : split[0];
  }

  private static ruleContainsIterable(rule: Rule) {
    return (rule.field &&
      rule.field.indexOf('[') > -1) ||
      (rule.toField &&
        rule.toField.indexOf('[') > -1);
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
      if (!rules[i].isAlwaysValid) {
        if (rules[i].or && rules[i].or.length) {
          if (!this.validateOrRule(rules[i], item)) {
            return false;
          }
        } else if (!this.validateRule(rules[i], item)) {
          return false;
        }
      }
    }
    return true;
  }

  private static validateOrRule(rule: Rule, item: AuctionItem): boolean {
    if (this.validateRule(rule, item)) {
      return true;
    }

    for (let i = 0; i < rule.or.length; i++) {
      if (this.validateRule(rule.or[i], item)) {
        return true;
      }
    }

    return false;
  }

  private static validateRule(rule: Rule, item: AuctionItem): boolean {
    const fromValue = this.getValue(item, rule.field);
    const toValue = this.getValue(item, rule.toField) || rule.toValue;
    if (fromValue === undefined) {
      return false;
    }

    switch (rule.targetValueType) {
      case TargetValueEnum.PERCENT:
        return this.comparePercent(rule, fromValue, toValue);
      case TargetValueEnum.GOLD:
        return this.compareNumbers(rule, GoldPipe.toCopper(fromValue), GoldPipe.toCopper(toValue));
      case TargetValueEnum.NUMBER:
        return this.compareNumbers(rule, fromValue, toValue);
      case TargetValueEnum.TEXT:
        return this.compareText(rule, fromValue, toValue);
      default:
        return false;
    }
  }

  private static getValue(item: AuctionItem, field: string): any {
    if (EmptyUtil.isNullOrUndefined(field)) {
      return undefined;
    }
    return this.getValueFromField(field, item);
  }

  static getValueFromField(field: string, item: AuctionItem) {
    const resultValues = [];
    const { regex, expressions } = this.getMathRegex(field);
    try {
      field.split(regex)
        .forEach((fieldPath, index) => {
          if (!isNaN(+fieldPath)) {
            resultValues.push(+fieldPath);
            return;
          }
          let value;
          fieldPath.split('.')
            .forEach(key => {
              if (EmptyUtil.isNullOrUndefined(value) && item[key] && item) {
                value = item[key];
              } else if (!EmptyUtil.isNullOrUndefined(value)) {
                value = value[key];
              }
            });
          if (!EmptyUtil.isNullOrUndefined(value)) {
            resultValues.push(value);
          }
        });
    } catch (error) {
      ErrorReport.sendError('DashboardCalculateUtil.getValueFromField', error);
    }
    return this.calculateField(resultValues, expressions);
  }

  private static getMathRegex(field: string) {
    const regex = /[*\-\/+]/gi;
    const expressions = field.match(regex);
    return { regex, expressions };
  }

  private static getResultObject(item: AuctionItem, columns: ColumnDescription[],
    paths: IdPaths, printLog: boolean = false) {
    const obj = {
      id: item.itemID,
      bonusIds: item.bonusIds,
      modifiers: item.modifiers,
      petSpeciesId: item.petSpeciesId,
      recipeId: paths.recipeId && +this.getValue(item, paths.recipeId),
      soldById: paths.soldById && +this.getValue(item, paths.soldById),
      droppedById: paths.droppedById && +this.getValue(item, paths.droppedById),
      zoneId: paths.zoneId && +this.getValue(item, paths.zoneId),
      mktPrice: item.mktPrice,
    };

    columns.forEach(column => {
      obj[column.key] = this.getValue(item, column.key);

      if (column.options && column.options.idName && column.options.idName !== 'recipeId') {
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
  private static compareNumbers(rule: Rule, fromValue: number, toValue: number) {
    const value: number = toValue !== undefined ? +toValue : +rule.toValue;
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
    const value = +toValue === +rule.toValue ? fromValue : fromValue / toValue;
    return this.compareNumbers(rule, value, +rule.toValue / 100);
  }

  private static compareText(rule: Rule, fromValue: string, toValue: string) {
    const value: string = (toValue || rule.toValue || '') + '';
    switch (rule.condition) {
      case ConditionEnum.CONTAINS:
        return TextUtil.contains(fromValue, value);
      case ConditionEnum.DOES_NOT_CONTAIN:
        return !TextUtil.contains(fromValue, value);
      case ConditionEnum.EQUAL_TO:
        return fromValue && TextUtil.isEqualIgnoreCase(fromValue, value);
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

  private static calculateField(resultValues: any[], mathExpressions: string[]) {
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

  private static setValueAtPath(childObject: any, it: any, partialPath: any[], targetIndex: number) {
    let currentLevel = childObject;
    partialPath.forEach((key, index) => {
      if (currentLevel[key]) {
        if (TextUtil.contains(key, '[')) {
          const arrayKey = key.replace(/[\[\]]/gi, '');
          currentLevel = [currentLevel[arrayKey][targetIndex]];
        } else {
          currentLevel = currentLevel[key];
        }
      } else if (index === partialPath.length - 1) {
        currentLevel[key] = it;
      }
    });
  }
}
