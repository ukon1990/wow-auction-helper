import {SharedService} from '../services/shared.service';
import {TSM} from '../models/auction/tsm';
import {AuctionHandler} from '../models/auction/auction-handler';
import {environment} from '../../environments/environment';
import {Pet} from '../models/pet';
import {Item} from '../models/item/item';
import {CraftingService} from '../services/crafting.service';

declare function require(moduleName: string): any;

export class MockLoaderUtil {

  initBaseData() {
    environment.test = true;
    this.setItems();
    this.setPets();
    this.setRecipes();
    this.setTSMData();
    this.setAuctionData();
  }

  setTSMData(): void {
    const tsm = this.getFile('tsm');
    (<TSM[]>tsm).forEach(a => {
      SharedService.tsm[a.Id] = a;
    });
  }

  setAuctionData(): void {
    AuctionHandler.organize(this.getFile('auctions'));
  }

  setPets(): void {
    const pets = this.getFile('pets');
    pets.forEach((pet: Pet) => {
      SharedService.pets[pet.speciesId] = pet;
    });
  }

  setItems(): void {
    const items = this.getFile('items');
    items.forEach((item: Item) => {
      SharedService.items[item.id] = item;
    });
  }

  setRecipes(): void {
    const service = new CraftingService(null, null, null, null);
    service.handleRecipes(this.getFile('recipes'));
  }

  getFile(name: string): any {
    return require(`./${name}.json`);
  }

}
