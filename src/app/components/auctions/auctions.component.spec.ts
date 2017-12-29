import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuctionsComponent } from './auctions.component';
import { TestModule } from '../../modules/test.module';
import { AuctionItem } from '../../models/auction/auction-item';
import { Item } from '../../models/item/item';
import { SharedService } from '../../services/shared.service';

describe('AuctionsComponent', () => {
  let component: AuctionsComponent;
  let fixture: ComponentFixture<AuctionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TestModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuctionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('should be able to check if demand query is matching', () => {
    it('When an auction item is below set value, false shall be returned', () => {
      const ai = new AuctionItem();
      ai.regionSaleRate = 0.08;
      component.form.controls['saleRate'].setValue(9);
      expect(component.isSaleRateMatch(ai)).toBeFalsy();
    });

    it('When an auction item is equal set value, true shall be returned', () => {
      const ai = new AuctionItem();
      ai.regionSaleRate = 0.09;
      component.form.controls['saleRate'].setValue(9);
      expect(component.isSaleRateMatch(ai)).toBeTruthy();
    });

    it('When an auction item is above set value, true shall be returned', () => {
      const ai = new AuctionItem();
      ai.regionSaleRate = 0.10;
      component.form.controls['saleRate'].setValue(9);
      expect(component.isSaleRateMatch(ai)).toBeTruthy();
    });
  });

  describe('should be able to check if item class query is working', () => {
    it('Should accept all item classes with a -1 or null value', () => {
      const ai = new AuctionItem();
      SharedService.items[25] = new Item();
      SharedService.items[25].itemClass = '1';
      ai.itemID = 25;

      component.form.controls['itemClass'].setValue(null);
      expect(component.isItemClassMatch(ai)).toBeTruthy();

      component.form.controls['itemClass'].setValue(-1);
      expect(component.isItemClassMatch(ai)).toBeTruthy();
    });

    it('Should be able true if the itemClass is a match', () => {
      const ai = new AuctionItem();
      SharedService.items[25] = new Item();
      SharedService.items[25].itemClass = '1';
      ai.itemID = 25;

      console.log(SharedService.items);
      component.form.controls['itemClass'].setValue(1);
      expect(SharedService.items[25].itemClass).toEqual('1');
      expect(component.form.value['itemClass']).toEqual(1);
      expect(component.isItemClassMatch(ai)).toBeTruthy();
    });
  });
});
