import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyAuctionsComponent } from './my-auctions.component';
import { TestModule } from '../../../modules/test.module';
import { SharedService } from '../../../services/shared.service';
import { User } from '../../../models/user/user';
import { Character } from '../../../models/character/character';
import { Item } from '../../../models/item/item';
import { AuctionHandler } from '../../../models/auction/auction-handler';
import { Auction } from '../../../models/auction/auction';

describe('MyAuctionsComponent', () => {
  let component: MyAuctionsComponent;
  let fixture: ComponentFixture<MyAuctionsComponent>;
  let realm = 'test-realm';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TestModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyAuctionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be able to do sorting by undercut', () => {
    const charlie = new Character(),
      hinata = new Character();
    charlie.name = 'Charlie';
    charlie.realm = realm;

    hinata.name = 'Hinata';
    hinata.realm = realm;

    User.import(JSON.stringify({
      realm: realm,
      region: 'eu',
      characters: [hinata, charlie]
    }));
    SharedService.items[25] = new Item();
    SharedService.items[25].name = 'An item';
    SharedService.items[26] = new Item();
    SharedService.items[26].name = 'Another item';
    AuctionHandler.organize([
      new Auction(30, 25, 10, 200, hinata.name, hinata.realm),
      new Auction(40, 26, 11, 200, charlie.name, charlie.realm),

      new Auction(2, 25, 9, 200, 'No thanks', hinata.realm),
      new Auction(3, 26, 12, 200, 'That person you hate', charlie.realm)
    ]);
    

    component.sortUndercut(SharedService.userAuctions.auctions);
    expect(component.getUserAuctions().auctions[0].auc).toBe(40);
    
    component.sortUndercut(SharedService.userAuctions.auctions);
    expect(component.getUserAuctions().auctions[0].auc).toBe(30);

    component.sortUndercut(SharedService.userAuctions.auctions);
    expect(component.getUserAuctions().auctions[0].auc).toBe(40);

    component.sortUndercut(SharedService.userAuctions.auctions);
    expect(component.getUserAuctions().auctions[0].auc).toBe(30);

    component.sortUndercut(SharedService.userAuctions.auctions);
    expect(component.getUserAuctions().auctions[0].auc).toBe(40);

    component.sortUndercut(SharedService.userAuctions.auctions);
    expect(component.getUserAuctions().auctions[0].auc).toBe(30);
  });
});
