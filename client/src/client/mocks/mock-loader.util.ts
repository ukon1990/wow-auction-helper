import {environment} from '../../environments/environment';
import {RealmService} from '../services/realm.service';
import {UserUtil} from '../utils/user/user.util';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TestModule} from '../modules/test.module';
import {MockComponent} from './mock.component';

declare function require(moduleName: string): any;

export class MockLoaderUtil {
  // The purpose of this one is to get a service, that can be used for tests
  private static fixture: ComponentFixture<MockComponent>;

  static component(): MockComponent {
    if (!this.fixture) {
      TestBed.configureTestingModule({
        imports: [TestModule]
      })
        .compileComponents();
      this.fixture = TestBed.createComponent(MockComponent);
    }
    return this.fixture.componentInstance;
  }

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

  setTSMData(): void {/*
    const tsm = this.getFile('tsm');
    (<TSM[]>tsm).forEach(a => {
      SharedService.tsm[a.Id] = a;
    });*/
  }

  setAuctionData(): void {/*
    const auctions = this.getFile('auctions');
    const service = new PetsService(null, null, null, null);
    AuctionUtil.organize(auctions['auctions'], service);*/
  }

  setPets(): void {/*
    const pets = this.getFile('pets');
    const service = new PetsService(null, null, null, null);
    service.handlePets(pets);*/
  }

  setItems(): void {/*
    const items = this.getFile('items');
    const service = new ItemService(null, null, null, null, null, null);
    SharedService.itemsUnmapped.length = 0;
    service.handleItems(items);*/
  }

  setRecipes(): void {/*
    const service = new CraftingService(null, null, null, null, null);
    service.handleRecipes(this.getFile('recipes'));*/
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

    UserUtil.restore();
  }

  private setRealms() {
    // const realms = this.getFile('realms');
    // const service = new RealmService(null, null);
    // service.handleRealms(realms);
  }
}
