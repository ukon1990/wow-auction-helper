export class GameBuild {

  /**
   * The version of the game client that the user uses
   */
  static readonly versions = [
    'Retail',
    'Classic'
  ];

  static readonly ADDONS = {
    AHDB: {file: 'AuctionDB.lua', name: 'AHDB'},
    Auctioneer: {file: 'Auc-ScanData.lua', name: 'Auctioneer'},
    TSM: {file: 'TradeSkillMaster.lua', name: 'TSM'}
  };

  /**
   * A list of wow expansions
   *
   * @static
   * @memberof GameBuild
   */
  static expansionMap = [
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
  static professions: string[] = [
    'Blacksmithing',
    'Leatherworking',
    'Alchemy',
    'Cooking',
    'Mining',
    'Tailoring',
    'Engineering',
    'Enchanting',
    'Jewelcrafting',
    'Inscription',
  ];

  static professionsClassic: string[] = [
    'Blacksmithing',
    'Leatherworking',
    'Alchemy',
    'Cooking',
    'Mining',
    'Tailoring',
    'Engineering',
    'Enchanting',
    'First aid',
  ];
}
