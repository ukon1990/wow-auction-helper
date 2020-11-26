import {DatabaseUtil} from '../utils/database.util';

export class RDSItemRepository {
  findMissingItems(conn: DatabaseUtil): Promise<number[]> {
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
}