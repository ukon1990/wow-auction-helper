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

      this.calculateRealmInventory(inventory, currentRealm);
    } catch (error) {
      ErrorReport.sendError('TsmLuaUtil.calculateInventory', error);
    }
  }

  private static calculateRealmInventory(inventory, currentRealm) {
    Object.keys(inventory)
      .forEach(realm =>
        this.calculateInventoryForFaction(realm, inventory, currentRealm));
  }

  private static calculateInventoryForFaction(realm: string, inventory: any, currentRealm: any) {
    Object.keys(inventory[realm])
      .forEach(faction =>
        this.calculateInventoryForRealm(inventory, realm, currentRealm, +faction));
  }

  private static calculateInventoryForRealm(inventory, realm, currentRealm, faction: number) {
    const userFaction = SharedService.user.faction;


    if (inventory[realm] && inventory[realm][faction]) {
      inventory[realm][faction].forEach((item: ItemInventory) => {
        this.calculateInventoryItem(item);
        this.addInventoryStatusForItem(realm, currentRealm, item, faction);
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

  private static addInventoryStatusForItem(realm: string, currentRealm: string, item: ItemInventory, faction: number) {
    const i = SharedService.items[item.id];
    if (realm === currentRealm && i) {
      if (!i.inventory) {
        i.inventory = {0: undefined, 1: undefined};
      }
      i.inventory[faction] = item;
    }
  }

  private static setInventory(tsmData) {

    try {
      const inventoryMap = {};

      this.processStorage(tsmData.bankQuantity, inventoryMap, 'Bank');
      this.processStorage(tsmData.mailQuantity, inventoryMap, 'Mail');
      this.processStorage(tsmData.reagentBankQuantity, inventoryMap, 'Reagent bank');
      this.processStorage(tsmData.bagQuantity, inventoryMap, 'Bags');

      tsmData.inventoryMap = inventoryMap;
      tsmData.inventory = {};

      this.processInventoryForRealms(inventoryMap, tsmData);
      this.calculateInventory(tsmData.inventory);
    } catch (error) {
      ErrorReport.sendError('TsmLuaUtil.setInventory', error);
    }
  }

  private static processInventoryForRealms(inventoryMap, tsmData) {
    Object.keys(inventoryMap).forEach(realm => {
      if (!tsmData.inventory[realm]) {
        tsmData.inventory[realm] = {};
      }

      Object.keys(inventoryMap[realm]).forEach(faction => {
        if (!tsmData.inventory[realm][faction]) {
          tsmData.inventory[realm][faction] = [];
        }
        this.populateInventoryForRealm(tsmData.inventory[realm][faction], inventoryMap[realm][faction]);
        this.sortRealmInventoryByQuantity(tsmData.inventory[realm][faction], realm, +faction);
      });
    });
  }

  private static populateInventoryForRealm(inventory: any[], inventoryMap) {

    Object.keys(inventoryMap).forEach(id =>
      inventory.push(inventoryMap[id]));
  }

  private static sortRealmInventoryByQuantity(inventory: ItemInventory[], realm: string, faction: number) {
    inventory.sort((a: ItemInventory, b: ItemInventory) =>
      b.quantity - a.quantity);
  }

  private static processStorage(storage, map, storedIn) {
    Object.keys(storage)
      .forEach(realm =>
        storage[realm].All.forEach(item =>
          this.addItemToInventory(item, map, storedIn, realm)));
  }

  private static addItemToInventory(item, map, storedIn: string, realm: string): void {
    try {
      if (!map[realm]) {
        map[realm] = {};
      }

      if (!map[realm][item.faction]) {
        map[realm][item.faction] = {};
      }

      if (!map[realm][item.id]) {
        map[realm][item.faction][item.id] = new ItemInventory(item, storedIn);
      } else {
        map[realm][item.faction][item.id].addCharacter(item, storedIn);
      }
    } catch (error) {
      ErrorReport.sendError('TsmLuaUtil.addItemToInventory', error);
    }
  }

}
