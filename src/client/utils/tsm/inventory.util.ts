import {Report} from '../report.util';
import {ItemInventory} from '../../models/item/item';
import {ErrorReport} from '../error-report.util';
import {SharedService} from '../../services/shared.service';

export class InventoryUtil {
  static organize(inventory): void {
    this.setInventory(inventory);
  }

  public static calculateInventory(inventory): void {
    try {
      const currentRealm = SharedService.realms[SharedService.user.realm].name;
      Object.keys(inventory)
        .forEach(realm =>
          this.calculateInventoryForRealm(inventory, realm, currentRealm));
    } catch (error) {
      ErrorReport.sendError('TsmLuaUtil.calculateInventory', error);
    }
  }

  private static calculateInventoryForRealm(inventory, realm, currentRealm) {
    if (inventory[realm]) {
      inventory[realm].forEach(item => {
        this.calculateInventoryItem(item);
        this.addInventoryStatusForItem(realm, currentRealm, item);
      });
    }
  }

  private static calculateInventoryItem(item) {
    const ahItem = SharedService.auctionItemsMap[item.id];
    if (ahItem) {
      item.buyout = ahItem.buyout;
      item.sumBuyout = ahItem.buyout * item.quantity;
    } else {
      item.buyout = 0;
      item.sumBuyout = 0;
    }
  }

  private static addInventoryStatusForItem(realm, currentRealm, item) {
    if (realm === currentRealm && SharedService.items[item.id]) {
      SharedService.items[item.id].inventory = item;
    }
  }

  private static setInventory(tsmData) {
    InventoryUtil.organize(tsmData);

    try {
      const map = {};
      Object.keys(tsmData.bankQuantity)
        .forEach(realm =>
          tsmData.bankQuantity[realm].All.forEach(item =>
            this.addItemToInventory(item, map, 'Bank', realm)));

      Object.keys(tsmData.mailQuantity).forEach(realm =>
        tsmData.mailQuantity[realm].All.forEach(item =>
          this.addItemToInventory(item, map, 'Mail', realm)));

      Object.keys(tsmData.reagentBankQuantity)
        .forEach(realm =>
          tsmData.reagentBankQuantity[realm].All.forEach(item =>
            this.addItemToInventory(item, map, 'Reagent bank', realm)));

      Object.keys(tsmData.bagQuantity)
        .forEach(realm =>
          tsmData.bagQuantity[realm].All.forEach(item =>
            this.addItemToInventory(item, map, 'Bags', realm)));

      tsmData.inventoryMap = map;
      tsmData.inventory = {};
      Object.keys(map).forEach(realm => {
        tsmData.inventory[realm] = [];

        Object.keys(map[realm]).forEach(id =>
          tsmData.inventory[realm].push(map[realm][id]));

        tsmData.inventory[realm].sort((a: ItemInventory, b: ItemInventory) =>
          b.quantity > a.quantity);
      });
      this.calculateInventory(tsmData.inventory);
    } catch (error) {
      ErrorReport.sendError('TsmLuaUtil.setInventory', error);
    }
  }

  private static addItemToInventory(item, map, storedIn: string, realm: string): void {
    try {
      if (!map[realm]) {
        map[realm] = {};
      }

      if (!map[realm][item.id]) {
        map[realm][item.id] = new ItemInventory(item, storedIn);
      } else {
        map[realm][item.id].addCharacter(item, storedIn);
      }
    } catch (error) {
      ErrorReport.sendError('TsmLuaUtil.addItemToInventory', error);
    }
  }
}
