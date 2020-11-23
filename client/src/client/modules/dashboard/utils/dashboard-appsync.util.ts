import {DashboardV2} from '../models/dashboard-v2.model';

export class DashboardAppsyncUtil {
  static reduce(boards: DashboardV2[]): any[] {
    return boards.map(board => {
      const copy = {
        ...board,
        columns: (board.columns || []).map(column => JSON.stringify(column)),
        rules: (board.rules || []).map(rule => JSON.stringify(rule)),
        itemRules: (board.itemRules || []).map(rule => JSON.stringify(rule)),
        sortRule: JSON.stringify(board.sortRule)
      };
      delete copy.data;
      delete copy.tsmShoppingString;
      delete copy.message;
      return copy;
    });
  }

  static unParseJSON(boards: any[]): DashboardV2[] {
    return boards.map(board => ({
      ...board,
      columns: board.columns.map(column => JSON.parse(column)),
      rules: board.rules.map(rule => JSON.parse(rule)),
      itemRules: board.itemRules.map(rule => JSON.parse(rule)),
      sortRule: JSON.parse(board.sortRule)
    }));
  }
}
