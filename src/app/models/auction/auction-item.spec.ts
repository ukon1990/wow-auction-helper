
import { async, TestBed } from '@angular/core/testing';
import { SharedService } from '../../services/shared.service';
import { AuctionItem } from './auction-item';

beforeEach(() => {
  // SharedService.tsm[]
  AuctionItem.organize([]);
});


describe('Auctions', () => {
  describe('Organizing auctions', () => {
    it('Should be able to organize auctions', () => {
      expect(SharedService.auctionItems[142335]).toBeTruthy();
    });
  });
});
