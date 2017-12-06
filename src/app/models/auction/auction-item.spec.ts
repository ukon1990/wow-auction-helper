
import { async, TestBed } from '@angular/core/testing';
import { SharedService } from '../../services/shared.service';
import { AuctionItem } from './auction-item';

beforeEach(() => {
  // SharedService.tsm[]
  AuctionItem.organize([
    {
      'auc': 261623576, 'item': 151566, 'owner': 'Dahilla', 'ownerRealm': 'Draenor',
      'bid': 279800, 'buyout': 279800, 'quantity': 1, 'timeLeft': 'VERY_LONG', 'rand': 0,
      'seed': 0, 'context': 0
    }, {
      'auc': 261623579, 'item': 151566, 'owner': 'Dahilla', 'ownerRealm': 'Draenor',
      'bid': 279800, 'buyout': 279800, 'quantity': 1, 'timeLeft': 'VERY_LONG', 'rand': 0,
      'seed': 0, 'context': 0
    }, {
      'auc': 261623571, 'item': 151566, 'owner': 'Dahilla', 'ownerRealm': 'Draenor',
      'bid': 279800, 'buyout': 279800, 'quantity': 1, 'timeLeft': 'VERY_LONG', 'rand': 0,
      'seed': 0, 'context': 0
    }, {
      'auc': 261623562, 'item': 151566, 'owner': 'Dahilla', 'ownerRealm': 'Draenor',
      'bid': 279800, 'buyout': 279800, 'quantity': 1, 'timeLeft': 'VERY_LONG', 'rand': 0,
      'seed': 0, 'context': 0
    }, {
      'auc': 261623564, 'item': 74248, 'owner': 'Hoodin', 'ownerRealm': 'Draenor',
      'bid': 312085, 'buyout': 312085, 'quantity': 1, 'timeLeft': 'VERY_LONG', 'rand': 0,
      'seed': 0, 'context': 0
    }, {
      'auc': 261623566, 'item': 151566, 'owner': 'Dahilla', 'ownerRealm': 'Draenor',
      'bid': 279800, 'buyout': 279800, 'quantity': 1, 'timeLeft': 'VERY_LONG', 'rand': 0,
      'seed': 0, 'context': 0
    }, {
      'auc': 261623552, 'item': 74248, 'owner': 'Hoodin', 'ownerRealm': 'Draenor',
      'bid': 312085, 'buyout': 312085, 'quantity': 1, 'timeLeft': 'VERY_LONG', 'rand': 0,
      'seed': 0, 'context': 0
    }, {
      'auc': 261099273, 'item': 32428, 'owner': 'Santadrood', 'ownerRealm': 'Draenor',
      'bid': 8286, 'buyout': 9207, 'quantity': 1, 'timeLeft': 'VERY_LONG', 'rand': 0,
      'seed': 0, 'context': 0
    }, {
      'auc': 261623555, 'item': 74248, 'owner': 'Hoodin', 'ownerRealm': 'Draenor',
      'bid': 312085, 'buyout': 312085, 'quantity': 1, 'timeLeft': 'VERY_LONG', 'rand': 0,
      'seed': 0, 'context': 0
    }, {
      'auc': 261623557, 'item': 151566, 'owner': 'Dahilla', 'ownerRealm': 'Draenor',
      'bid': 279800, 'buyout': 279800, 'quantity': 1, 'timeLeft': 'VERY_LONG', 'rand': 0,
      'seed': 0, 'context': 0
    }
  ]);
});


describe('Auctions', () => {
  describe('Organizing auctions', () => {
    it('Should be able to organize auctions', () => {
      expect(SharedService.auctionItems[151566]).toBeTruthy();
    });
  });
});
