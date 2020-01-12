export class NPCQuery {
  static getAllAfterTimestamp(timestamp: string) {
    return `SELECT * FROM npc
            WHERE UNIX_TIMESTAMP(timestamp) > ${+new Date(timestamp) / 1000}
            ORDER BY timestamp desc;`;
  }

  static getAllJoinedAfterTimestamp(timestamp: string) {
    return `SELECT npc.id as id, isAlliance, isHorde, minLevel, maxLevel, zoneId, expansionId,
                              npc.timestamp as timestamp, COALESCE(locale.en_GB, 'Missing name') as name, COALESCE(tag.en_GB, '') as tag,
                              sells.id as sellId, sells.standing, sells.stock, sells.price,
                              sells.unitPrice, sells.stackSize, sells.currency,
                              drops.id as dropId, drops.dropped, drops.outOf, drops.dropChance,
                              coords.x, coords.y
                FROM npc AS npc
                  LEFT OUTER JOIN npcName AS locale ON npc.id = locale.id
                  LEFT OUTER JOIN npcTag AS tag ON npc.id = tag.id
                  LEFT OUTER JOIN npcSells AS sells ON npc.id = sells.npcId
                  LEFT OUTER JOIN npcDrops AS drops ON npc.id = drops.npcId
                  LEFT OUTER JOIN npcCoordinates AS coords ON npc.id = coords.id
                WHERE UNIX_TIMESTAMP(npc.timestamp) > ${+new Date(timestamp) / 1000}
                ORDER BY timestamp desc;`;
  }
}
