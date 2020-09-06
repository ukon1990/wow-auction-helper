export class RealmQuery {
  static getUpdateHistoryForRealm(ahId: number, sinceTimestamp: number): string {
    return `SELECT *
            FROM auction_houses_dump_log
            WHERE ahId = ${ahId} AND lastModified >= ${sinceTimestamp}
            ORDER BY lastModified desc;`;
  }

  static insertHouse(house): string {
    return `INSERT INTO \`100680-wah\`.\`auction_houses\`
                  (\`region\`,
                  \`isUpdating\`,
                  \`isActive\`,
                  \`autoUpdate\`)
                  VALUES
                  ("${house.region}",
                  0,
                  1,
                  1);`;
  }

  static insertRealm(realm): string {
    return `INSERT INTO \`100680-wah\`.\`auction_house_realm\`
              (\`ahId\`,
              \`slug\`,
              \`name\`,
              \`battlegroup\`,
              \`timezone\`,
              \`locale\`)
              VALUES
              (${realm.ahId},
              "${realm.slug}",
              "${realm.name}",
              "${realm.battlegroup}",
              "${realm.timezone}",
              "${realm.locale}");`;
  }

  static getAllMinimal(): string {
    return `SELECT ah.id as id, region, slug, connectedId
            FROM auction_houses as ah
                     LEFT OUTER JOIN (
                SELECT ahId, slug, name
                FROM auction_house_realm
                GROUP BY ahId) as realm
                                     ON ah.id = realm.ahId
            WHERE ah.id = realm.ahId
              AND connectedId IS NULL
            ORDER BY lastRequested DESC;`;
  }

  static getAll(): string {
    return `SELECT ahId,
                   connectedId,
                   region,
                   slug,
                   name,
                   battlegroup,
                   locale,
                   timezone,
                   ah.url          as url,
                   ah.lastModified as lastModified,
                   lowestDelay,
                   avgDelay,
                   highestDelay,
                   ah.size         as size,
                   tsm.url         as tsmUrl,
                   ah.autoUpdate   as autoUpdate
            FROM auction_house_realm AS realm
                     LEFT OUTER JOIN auction_houses AS ah
                                     ON ah.id = realm.ahId
                     LEFT OUTER JOIN tsmDump AS tsm
                                     ON tsm.id = realm.ahId
            ORDER BY name;`;
  }

  static getAllHouses(): string {
    return `SELECT ah.id,
                   connectedId as id,
                   region,
                   slug,
                   name,
                   url,
                   lastModified,
                   lowestDelay,
                   avgDelay,
                   highestDelay
            FROM auction_houses as ah
                     LEFT OUTER JOIN (
                SELECT ahId, slug, name
                FROM auction_house_realm
                GROUP BY ahId) as realm
                                     ON ah.id = realm.ahId
            WHERE ah.id = realm.ahId;`;
  }

  /*
  * Updating Any house that probably has an update incoming or that has not received an update in 1 day
  */
  static getAllHousesWithLastModifiedOlderThanPreviousDelayOrOlderThanOneDay() {
    /* Not doing "AND isUpdating = 0" as the lambda will time out after 30 seconds and the update check interval is once per minute... */
    const hours = 4; // old: 24
    return `SELECT ah.id                                                             as id,
                   connectedId,
                   region,
                   slug,
                   name,
                   url,
                   lastModified,
                   lowestDelay,
                   avgDelay,
                   highestDelay,
                   (ROUND(UNIX_TIMESTAMP(CURTIME(4)) * 1000) - lastModified) / 60000 as timeSince,
                   timestamp
            FROM auction_houses as ah
                     LEFT OUTER JOIN (
                SELECT ahId, slug, name
                FROM auction_house_realm
                GROUP BY ahId) as realm
                                     ON ah.id = realm.ahId
                     LEFT JOIN (
                SELECT realm.ahId as ahId, MAX(timestamp) AS timestamp
                FROM \`s3-logs\` as logs
                         JOIN (
                    SELECT realm.ahId as ahId, house.region as region, slug, name, locale, timeZone
                    FROM auction_house_realm AS realm
                             LEFT JOIN auction_houses AS house ON house.id = realm.ahId
                ) as realm ON CONCAT(realm.slug, '.json.gz') = fileName
                WHERE timestamp >= NOW() - INTERVAL 24 HOUR
                  AND logs.ahId IS NULL
                  AND fileName NOT LIKE 'status.json.gz'
                GROUP BY logs.region, slug
            ) as log ON log.ahId = ah.id
            WHERE isActive = 1
              AND name IS NOT NULL
              AND (
                    (
                            autoUpdate = 1 AND FROM_UNIXTIME(lastModified / 1000) <= NOW() - INTERVAL lowestDelay MINUTE
                        )
                    OR (ROUND(UNIX_TIMESTAMP(CURTIME(4)) * 1000) - lastModified) / 60000 / 60 / 4 > 1
                )
            ORDER BY timestamp DESC, autoUpdate DESC, (ROUND(UNIX_TIMESTAMP(CURTIME(4)) * 1000) - lastModified) / 60000 DESC
            LIMIT 20;`;
  }

  static insertNewDumpLogRow(ahId: number, url: string, lastModified: number, oldLastModified: number, size: number): string {
    return `INSERT INTO \`100680-wah\`.\`auction_houses_dump_log\`
              (\`ahId\`,
              \`lastModified\`,
              \`url\`,
              \`timeSincePreviousDump\`,
              \`size\`)
              VALUES
              (
              ${ahId},
              ${lastModified},
              "${url}",
              ${lastModified - oldLastModified},
              ${size});`;
  }

  static updateUrl(ahId: number, url: string, lastModified: number, size: number,
                   delay: { avg: number; highest: number; lowest: number }): string {
    return `UPDATE \`100680-wah\`.\`auction_houses\`
            SET
              \`url\` = "${url}",
              \`lastModified\` = ${lastModified},
              \`isUpdating\` = 0,
              \`size\` = ${size},
              \`lowestDelay\` = ${delay.lowest},
              \`avgDelay\` = ${delay.avg},
              \`highestDelay\` = ${delay.highest}
                WHERE \`id\` = ${ahId};`;
  }

  static getHouse(id: number, limit = 1): string {
    return `SELECT ahId as id, connectedId, region, slug, name, battlegroup, locale, timezone, url, lastModified
            FROM auction_house_realm as realm
            LEFT OUTER JOIN auction_houses as ah
            ON ah.id = realm.ahId
            WHERE ahid = ${id}
            ${limit ? `LIMIT ${limit}` : ''};`;
  }

  static getHouseForRealm(region: string, realmSlug: string): string {
    return `SELECT ah.id as id, connectedId, region, ah.url as url, tsm.url as tsmUrl, ah.lastModified as lastModified,
                    isUpdating, isActive, autoUpdate, size, lowestDelay, avgDelay, highestDelay, firstRequested, lastRequested
            FROM auction_houses as ah
              LEFT OUTER JOIN tsmDump as tsm
              ON ah.id = tsm.id
            WHERE ah.id IN (
                  SELECT ahId
                  FROM auction_house_realm
                  WHERE slug = "${realmSlug}")
                AND region = "${region}";`;
  }

  static isUpdating(id: number, isUpdating: boolean) {
    return `UPDATE \`100680-wah\`.\`auction_houses\`
            SET
              \`isUpdating\` = ${isUpdating ? 1 : 0}
                WHERE \`id\` = ${id};`;
  }

  static isUpdatingByRealmAndRegion(region: string, realm: string, isUpdating: boolean) {
    return `UPDATE \`100680-wah\`.\`auction_houses\`
            SET
              \`isUpdating\` = ${isUpdating ? 1 : 0}
                WHERE \`id\` IN (
                    SELECT ah.id as ahId, slug
                    FROM auction_house_realm
                    LEFT OUTER JOIN (
                      SELECT a.id, region
                      FROM auction_houses as a) AS ah
                      ON ah.id = ahId
                    WHERE region = '${region}' and slug = '${realm}';
                );`;
  }

  static activateHouse(id: any): string {
    return `UPDATE \`100680-wah\`.\`auction_houses\`
            SET
              \`firstRequested\` = ${+new Date()},
              \`lastRequested\` = ${+new Date()},
              \`autoUpdate\` = 1
                WHERE \`id\` = ${id};`;
  }

  static updateLastRequested(id: any): string {

    return `UPDATE \`100680-wah\`.\`auction_houses\`
            SET
              \`lastRequested\` = ${+new Date()}
                WHERE \`id\` = ${id};`;
  }

  static setNonRequestedHousesToNotAutoUpdate(days: number): string {
    return `UPDATE auction_houses as ah
            SET autoUpdate = 0
            WHERE (ROUND(UNIX_TIMESTAMP(CURTIME(4)) * 1000) - lastRequested) / 60000 / 60 / 24 > ${days}
                AND autoUpdate = 1;`;
  }
}
