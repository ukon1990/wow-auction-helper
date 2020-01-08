import {SharedService} from '../services/shared.service';
import {TSM} from '../modules/auction/models/tsm.model';
import {AuctionUtil} from '../modules/auction/utils/auction.util';
import {environment} from '../../environments/environment';
import {Pet} from '../modules/pet/models/pet';
import {Item} from '../models/item/item';
import {CraftingService} from '../services/crafting.service';
import {ItemService} from '../services/item.service';
import {PetsService} from '../services/pets.service';
import {User} from '../models/user/user';
import {AuctionsService} from '../services/auctions.service';
import {RealmService} from '../services/realm.service';

declare function require(moduleName: string): any;

export class MockLoaderUtil {

  initBaseData() {
    environment.test = true;
    this.setRealms();
    this.setUser();
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
    const auctions = this.getFile('auctions');
    const service = new PetsService(null, null, null, null);
    AuctionUtil.organize(auctions['auctions'], service);
  }

  setPets(): void {
    const pets = this.getFile('pets');
    const service = new PetsService(null, null, null, null);
    service.handlePets(pets);
  }

  setItems(): void {
    const items = this.getFile('items');
    const service = new ItemService(null, null, null, null, null);
    SharedService.itemsUnmapped.length = 0;
    service.handleItems(items);
  }

  setRecipes(): void {
    const service = new CraftingService(null, null, null, null, null);
    service.handleRecipes(this.getFile('recipes'));
  }

  getFile(name: string): any {
    return require(`./${name}.json`);
  }


  setUser(): void {
    localStorage['region'] = 'eu';
    localStorage['realm'] = 'draenor';
    localStorage['character'] = '';

    localStorage['api_tsm'] = null;
    localStorage['api_wowuction'] = null;
    localStorage['api_to_use'] = 'tsm';

    localStorage['timestamp_news'] = '123';

    User.restore();
  }

  private setRealms() {
    const realms = this.getFile('realms');
    const service = new RealmService(null, null, null);
    service.handleRealms(realms);
  }
}
