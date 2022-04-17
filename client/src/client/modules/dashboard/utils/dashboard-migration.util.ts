import {Dashboard} from '@shared/models';
import {ConditionEnum} from '@shared/enum/dashboard/condition.enum';
import {TargetValueEnum} from '@shared/enum/dashboard/target-value.enum';
import {columnConfig} from '../data/columns.data';
import {Watchlist} from '../models/watchlist.model';
import {WatchlistGroup} from '../models/watchlist-group.model';
import {WatchlistItem} from '../models/watchlist-item.model';
import {ItemRule, Rule} from "@shared/models/dashboard";

export interface OldGroups {
  groups: {
    name: string;
    matchDailySold: number;
    matchSaleRate: number;
    hide?: boolean;
    items: {
      itemID: number;
      name: string;
      value: number;
      compareTo: string;
      targetType: string;
      criteria: string;
      minCraftingProfit: number;
      target: string | null;
    }[];
  }[];
}

export class DashboardMigrationUtil {
  static migrate(groups: OldGroups): Dashboard[] {
    const boards: Dashboard[] = [];
    const wl: Watchlist = new Watchlist(null);
    wl.restoreFrom(groups);
    wl.groups.forEach((group: WatchlistGroup) =>
      this.handleWatchlistGroup(group, boards));
    return boards;
  }

  private static handleWatchlistGroup(group: WatchlistGroup, boards: Dashboard[]) {
    const itemRules = new Map<number, ItemRule>();
    const ruleMap = new Map<string, Rule>();
    const board: Dashboard = this.getBaseBoard(group);

    this.setDailySoldAndSaleRate(group, board);
    boards.push(board);

    if (group.items.length) {
      group.items.forEach(item =>
        this.handleWatchlistItem(item, itemRules, board));
    }
  }

  private static handleWatchlistItem(item: WatchlistItem, itemRules: Map<number, ItemRule>, board: Dashboard) {
    const rule: Rule = this.getBaseRule(item);
    if (!itemRules.has(item.itemID)) {
      this.addNewItemRule(item, itemRules, board, rule);
    } else {
      itemRules.get(item.itemID).rules[0].or.push(rule);
    }
  }

  private static addNewItemRule(item: WatchlistItem, itemRules: Map<number, ItemRule>, board: Dashboard, rule: Rule) {
    const itemRule: ItemRule = {
      itemId: item.itemID,
      rules: []
    };
    itemRules.set(item.itemID, itemRule);
    board.itemRules.push(itemRule);
    itemRules.get(item.itemID).rules.push(rule);
  }

  private static getBaseRule(item: WatchlistItem) {
    return {
      field: 'buyout',
      condition: this.translateCondition(item.criteria),
      targetValueType: this.translateTargetValueType(item.targetType),
      toField: this.translateField(item.compareTo),
      toValue: item.value,
      or: [],
    };
  }

  private static getBaseBoard(group: WatchlistGroup): Dashboard {
    return {
      title: group.name,
      idParam: 'id',
      columns: [
        columnConfig.item.name,
        columnConfig.auction.buyout,
        columnConfig.item.vendorSell,
        columnConfig.recipe.shoppingCartInput,
      ],
      data: [],
      sortOrder: 0,
      rules: [],
      itemRules: [],
      lastModified: +new Date(),
      onlyItemsWithRules: true
    };
  }

  private static setDailySoldAndSaleRate(group: WatchlistGroup, board: Dashboard) {
    /* TODO: If TSM is public again
    if (group.matchDailySold) {
      board.rules.push({
        field: columnConfig.auction.avgDailySold.key,
        condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
        targetValueType: TargetValueEnum.NUMBER,
        toValue: group.matchDailySold,
      });
    }

    if (group.matchSaleRate) {
      board.rules.push({
        field: columnConfig.auction.regionSaleRate.key,
        condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
        targetValueType: TargetValueEnum.PERCENT,
        toValue: group.matchSaleRate,
      });
    }
    */
  }

  private static translateCondition(criteria: string): ConditionEnum {
    switch (criteria) {
      case 'above':
        return ConditionEnum.GREATER_THAN_OR_EQUAL_TO;
      case 'equal':
        return ConditionEnum.EQUAL_TO;
      default:
        return ConditionEnum.LESS_THAN_OR_EQUAL_TO;
    }
  }

  private static translateField(field: string): string {
    if (field === 'craftCost') {
      return columnConfig.recipe.knownCost.key;
    }
    return field;
  }

  private static translateTargetValueType(targetType: string): TargetValueEnum {
    switch (targetType) {
      case 'quantity':
        return TargetValueEnum.NUMBER;
      case 'gold':
        return TargetValueEnum.GOLD;
      default:
        return TargetValueEnum.PERCENT;
    }
  }
}