export class UpdatesRepository {
  static getLatestTimestamps(): string {
    return `
        SELECT *
        FROM (
                 SELECT MAX(timestamp) as recipes
                 FROM recipes
                 ORDER BY timestamp DESC
             ) recipes,
             (
                 SELECT MAX(timestamp) as recipesClassic
                 FROM recipesClassic
                 ORDER BY timestamp DESC
             ) recipesClassic,
             (
                 SELECT MAX(timestamp) as items
                 FROM items
                 ORDER BY timestamp DESC
             ) items,
             (
                 SELECT MAX(timestamp) as itemsClassic
                 FROM itemsClassic
                 ORDER BY timestamp DESC
             ) itemsClassic,
             (
                 SELECT MAX(timestamp) as npcs
                 FROM npc
                 ORDER BY timestamp DESC
             ) npcs,
             (
                 SELECT MAX(timestamp) as pets
                 FROM pets
                 ORDER BY timestamp DESC
             ) pets,
             (
                 SELECT MAX(timestamp) as zones
                 FROM zone
                 ORDER BY timestamp DESC
             ) zones,
             (
                 SELECT MAX(timestamp) as professions
                 FROM professions
                 ORDER BY timestamp DESC
             ) professions;`;
  }
}