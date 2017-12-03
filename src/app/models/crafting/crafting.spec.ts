import { async, TestBed } from '@angular/core/testing';
import { SharedService } from '../../services/shared.service';
import { AuctionItem } from '../auction/auction-item';
import { Crafting } from './crafting';

beforeEach(() => {
  SharedService.recipes.length = 0;
  SharedService.auctionItems[10] = new AuctionItem();
  SharedService.auctionItems[10].buyout = 20;
  SharedService.auctionItems[11] = new AuctionItem();
  SharedService.auctionItems[11].buyout = 10;
  SharedService.auctionItems[12] = new AuctionItem();
  SharedService.auctionItems[12].buyout = 30;
  SharedService.recipes.push({
    spellID: 1,
    itemID: 1,
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
    });
    it('for several reagents', () => {
      // logic
    });
    it('if some items aren\'t at AH', () => {
      // logic
    });
    it('if some items aren\'t at AH and use market value instead.', () => {
      // logic
    });
    it('if some items aren\'t at AH and use avg sold for value instead.', () => {
      // logic
    });
  });
});
