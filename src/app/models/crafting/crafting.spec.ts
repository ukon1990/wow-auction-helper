import { async, TestBed } from '@angular/core/testing';
import { SharedService } from '../../services/shared.service';
import { AuctionItem } from '../auction/auction-item';
import { Crafting } from './crafting';
import { User } from '../user/user';

beforeEach(() => {
  User.restore();

  SharedService.recipes.length = 0;
  SharedService.auctionItems[10] = new AuctionItem();
  SharedService.auctionItems[10].buyout = 20;
  SharedService.auctionItems[11] = new AuctionItem();
  SharedService.auctionItems[11].buyout = 10;
  SharedService.auctionItems[12] = new AuctionItem();
  SharedService.auctionItems[12].buyout = 30;
  SharedService.recipes.push({
    spellID: 1,
    itemID: 10,
    name: 'test recipe',
    profession: 'Software developer',
    minCount: 1,
    maxCount: 1,
    reagents: []
  });
});

describe('Crafting', () => {
  describe('Should be able to calculate cost', () => {
    it('for one reagent', () => {
      SharedService.recipes[0].reagents.push({
        itemID: 11,
        name: '',
        count: 3
      });
      Crafting.calculateCost();
      expect(SharedService.recipes[0].cost).toEqual(30);
      expect(SharedService.recipes[0].roi).toEqual(-10);
    });

    it('for several reagents', () => {
      SharedService.recipes[0].reagents.push({
        itemID: 11,
        name: '',
        count: 3
      });
      SharedService.recipes[0].reagents.push({
        itemID: 12,
        name: '',
        count: 10
      });
      Crafting.calculateCost();
      expect(SharedService.recipes[0].cost).toEqual(330);
      expect(SharedService.recipes[0].roi).toEqual(-310);
    });

    it('if some items aren\'t at AH', () => {
      SharedService.recipes[0].reagents.push({
        itemID: 1,
        name: '',
        count: 3
      });
      SharedService.recipes[0].reagents.push({
        itemID: 12,
        name: '',
        count: 10
      });
      Crafting.calculateCost();
      expect(SharedService.recipes[0].cost).toEqual(300);
      expect(SharedService.recipes[0].roi).toEqual(-280);
    });

    it('if some items aren\'t at AH and use market value instead.', () => {
      // logic
      SharedService.user.apiToUse = 'tsm';
    });

    it('The item is above set limit, so use market value instead.', () => {
      // Buyout is 200% of MV
      SharedService.user.buyoutLimit = 200;
      SharedService.user.apiToUse = 'tsm';
    });

    it('if some items aren\'t at AH and use avg sold for value instead.', () => {
      SharedService.user.apiToUse = 'tsm';
    });
  });
});
