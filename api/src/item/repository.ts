import {DatabaseUtil} from '../utils/database.util';

export class RDSItemRepository {
  findMissingItemsFromAuctionsAndCrafts(conn: DatabaseUtil): Promise<number[]> {
    return new Promise<number[]>(((resolve, reject) => {
      conn.query(`
                                  SELECT *
                                  FROM (
                                  SELECT craftedItemId as id
                                  FROM recipes WHERE craftedItemId NOT IN (
                                    SELECT id FROM items
                                  )
                                  UNION ALL
                                  SELECT hordeCraftedItemId as id
                                  FROM recipes WHERE hordeCraftedItemId NOT IN (
                                    SELECT id FROM items
                                  )
                                  UNION ALL
                                  SELECT allianceCraftedItemId as id
                                  FROM recipes WHERE allianceCraftedItemId NOT IN (
                                    SELECT id FROM items
                                  )
                                  UNION ALL
                                  SELECT itemId as id
                                  FROM reagents WHERE itemId NOT IN (
                                    SELECT id FROM items
                                  )
                                  UNION ALL
                                  SELECT itemId as id
                                  FROM itemPriceHistoryPerHour
                                  WHERE date >= NOW() - INTERVAL 2 DAY AND itemId NOT IN (
                                    SELECT id FROM items
                                  )) as tbl
                                  GROUP BY id
                                  ORDER BY id DESC;`)
        .then(res => {
          resolve(res.map(({id}) => id));
        })
        .catch(reject);
    }));
  }

  findMissingItemsFromAuctions(conn: DatabaseUtil): Promise<number[]> {
    return new Promise<number[]>(((resolve, reject) => {
      conn.query(`
                  SELECT itemId as id
                  FROM itemPriceHistoryPerHour
                  WHERE date > '2020-11-24' AND itemId NOT IN (
                    SELECT id FROM items
                  )
                  GROUP BY id
                  ORDER BY id DESC;`)
        .then(res => {
          resolve(res.map(({id}) => id));
        })
        .catch(reject);
    }));
  }

  getAllItemIdsFromCurrentExpansion(conn: DatabaseUtil) {
    return new Promise<number[]>(((resolve, reject) => {
      conn.query(`
          SELECT id
          FROM items
          WHERE expansionId = 8 AND timestamp < NOW() - INTERVAL 1 DAY;`)
        .then(res => {
          resolve(res.map(({id}) => id));
        })
        .catch(reject);
    }));
  }
}
