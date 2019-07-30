import { Item } from '../models/item/item';

export class GameBuild {
  /**
   * A list of wow expansions
   *
   * @static
   * @memberof GameBuild
   */
  public static expansionMap = [
    'Classic',
    'Burning crusade',
    'Wrath of the Lich king',
    'Cataclysm',
    'Mists of Pandaria',
    'Warlords of Draenor',
    'Legion',
    'Battle for Azeroth'
  ];

  /**
   * This is a ugly method of returning expansion for item
   *
   * @static
   * @returns {string} Expanion name
   * @memberof GameBuild
   */
  public static getExpansion(item: Item): string {/*
    // BFA
    if (item.id > 27101) {
      return GameBuild.expansionMap[7];
    }
    // Legion
    if (item.id > 22521) {
      return GameBuild.expansionMap[6];
    }
    /*
    // WOD
    if (item.id > 19115) {
      return GameBuild.expansionMap[5];
    }
    // MOP
    if (item.id > 16015) {
      return GameBuild.expansionMap[4];
    }
    // Cata
    if (item.id > 13163) {
      return GameBuild.expansionMap[3];
    }
    // WotLK
    if (item.id > 8713) {
      return GameBuild.expansionMap[2];
    }
    // BC
    if (item.id > 21800) {
      return GameBuild.expansionMap[1];
    }*/
    return GameBuild.expansionMap[0];
  }
}
