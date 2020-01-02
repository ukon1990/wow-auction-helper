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

  static expansionMaxLevel = [
    60,
    70,
    80,
    85,
    90,
    100,
    110,
    120
  ];
  static territories = ['Alliance', 'Horde', 'Contested', 'Word PvP', 'Sanctuary', 'PvP'];

  static zoneType = ['Zone', 'City', 'Dungeon', 'Raid', 'Scenario', 'Artifact Acquisition', 'Battleground'];
}
