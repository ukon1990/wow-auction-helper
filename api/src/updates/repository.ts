export class UpdatesRepository {
  static getLatestTimestamps(): string {
    return `
        SELECT *
        FROM (
                 SELECT timestamp as recipes
                 FROM recipes_new
                 ORDER BY timestamp DESC
                 LIMIT 1
             ) recipes,
             (
                 SELECT timestamp as items
                 FROM items
                 ORDER BY timestamp DESC
                 LIMIT 1
             ) items,
             (
                 SELECT timestamp as npcs
                 FROM npc
                 ORDER BY timestamp DESC
                 LIMIT 1
             ) npcs,
             (
                 SELECT timestamp as pets
                 FROM pets
                 ORDER BY timestamp DESC
                 LIMIT 1
             ) pets,
             (
                 SELECT timestamp as zones
                 FROM zone
                 ORDER BY timestamp DESC
                 LIMIT 1
             ) zones;`;
  }
}