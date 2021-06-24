import {DatabaseUtil} from '../utils/database.util';

export class RDSItemRepository {
  findMissingItemsFromAuctionsAndCrafts(conn: DatabaseUtil): Promise<number[]> {
    return new Promise<number[]>(((resolve, reject) => {
      conn.query(`
          SELECT *
          FROM (
                   SELECT craftedItemId as id
                   FROM recipes
                   WHERE craftedItemId NOT IN (
                       SELECT id
                       FROM items
                   )
                   UNION ALL
                   SELECT hordeCraftedItemId as id
                   FROM recipes
                   WHERE hordeCraftedItemId NOT IN (
                       SELECT id
                       FROM items
                   )
                   UNION ALL
                   SELECT allianceCraftedItemId as id
                   FROM recipes
                   WHERE allianceCraftedItemId NOT IN (
                       SELECT id
                       FROM items
                   )
                   UNION ALL
                   SELECT itemId as id
                   FROM reagents
                   WHERE itemId NOT IN (
                       SELECT id
                       FROM items
                   )
                   UNION ALL
                   SELECT itemId as id
                   FROM itemPriceHistoryPerHour
                   WHERE date >= NOW() - INTERVAL 2 DAY
                     AND itemId NOT IN (
                       SELECT id
                       FROM items
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
          SELECT *
          FROM (
                   SELECT craftedItemId as id
                   FROM recipes
                   WHERE craftedItemId NOT IN (
                       SELECT id
                       FROM items
                   )
                   UNION ALL
                   SELECT hordeCraftedItemId as id
                   FROM recipes
                   WHERE hordeCraftedItemId NOT IN (
                       SELECT id
                       FROM items
                   )
                   UNION ALL
                   SELECT allianceCraftedItemId as id
                   FROM recipes
                   WHERE allianceCraftedItemId NOT IN (
                       SELECT id
                       FROM items
                   )
                   UNION ALL
                   SELECT itemId as id
                   FROM reagents
                   WHERE itemId NOT IN (
                       SELECT id
                       FROM items
                   )
                   UNION ALL
                   SELECT itemId as id
                   FROM itemPriceHistoryPerDay
                   WHERE date >= NOW() - INTERVAL 30 DAY
                     AND itemId NOT IN (
                       SELECT id
                       FROM items
                       )) as tbl
          GROUP BY id
          ORDER BY id DESC;`)
        .then(res => {
          resolve(res.map(({id}) => id));
        })
        .catch(reject);
    }));
  }

  findMissingItemsFromAuctionsClassic(conn: DatabaseUtil): Promise<number[]> {
    return new Promise<number[]>(((resolve, reject) => {
      conn.query(`
          SELECT *
          FROM (SELECT craftedItemId AS id
                FROM recipesClassic
                WHERE craftedItemId NOT IN (SELECT id
                                            FROM itemsClassic)
                UNION ALL
                SELECT itemId AS id
                FROM reagentsClassic
                WHERE itemId NOT IN (SELECT id
                                     FROM items)
                UNION ALL
                SELECT id
                FROM itemsClassic
                WHERE id NOT IN (SELECT id
                                     FROM itemClassic_name_locale)
                UNION ALL
                SELECT itemId AS id
                FROM itemPriceHistoryPerDay
                WHERE
                    date >= NOW() - INTERVAL 14 DAY
                  AND ahTypeId
                    > 0
                  AND itemId NOT IN (SELECT
                    id
                    FROM
                    itemsClassic)) AS tbl
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
          WHERE expansionId = 8
            AND timestamp
              < NOW() - INTERVAL 1 DAY;`)
        .then(res => {
          resolve(res.map(({id}) => id));
        })
        .catch(reject);
    }));
  }
}
