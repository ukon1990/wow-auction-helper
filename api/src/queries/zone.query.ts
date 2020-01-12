export class ZoneQuery {
  static getAllAfterTimestamp(locale: string, timestamp: string) {
    return `
            SELECT
                   i.id,
                   COALESCE(${locale}, 'MISSING THE LOCALE IN DB!') as name,
                   territoryId,
                   typeId,
                   parentId,
                   minLevel,
                   maxLevel,
                   timestamp
            FROM zone as i
            LEFT OUTER JOIN zoneName as l
            ON i.id = l.id
            WHERE UNIX_TIMESTAMP(timestamp) > ${+new Date(timestamp) / 1000}
            ORDER BY timestamp desc;`;
  }
}
