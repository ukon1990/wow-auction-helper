import {DatabaseUtil} from '../utils/database.util';

export class AdminRepository {

  optimizeTable(table: string): Promise<void> {
    return new DatabaseUtil()
      .query('OPTIMIZE TABLE itemPriceHistoryPerHour;');
  }
}