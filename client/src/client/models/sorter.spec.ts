import { async, TestBed } from '@angular/core/testing';
import { Sorter } from './sorter';
import { SharedService } from '../services/shared.service';
import { AuctionItem } from '../modules/auction/models/auction-item.model';
import {AuctionsService} from '../services/auctions.service';
import {MockLoaderUtil} from '../mocks/mock-loader.util';

let sorter: Sorter,
  arr = [],
  service: AuctionsService;

beforeEach(() => {
  service = MockLoaderUtil.component().auctionsService;
  sorter = new Sorter(service);
  arr = [
    { id: 1, name: 'Arch' },
    { id: 2, name: 'Aisha' },
    { id: 3, name: 'Yoghurt' },
    { id: 4, name: 'Banana' },
    { id: 5, name: 'Jonas' },
    { id: 6, name: 'Mint' }
  ];
});

describe('sort', () => {
  it('should sort strings ascending', () => {
    sorter.addKey('name');
    sorter.addKey('name');
    sorter.sort(arr);

    expect(arr).toEqual([
      { id: 2, name: 'Aisha' },
      { id: 1, name: 'Arch' },
      { id: 4, name: 'Banana' },
      { id: 5, name: 'Jonas' },
      { id: 6, name: 'Mint' },
      { id: 3, name: 'Yoghurt' }
    ]);
  });

  it('should sort strings descending', () => {
    sorter.addKey('name');
    sorter.sort(arr);

    expect(arr).toEqual([
      { id: 3, name: 'Yoghurt' },
      { id: 6, name: 'Mint' },
      { id: 5, name: 'Jonas' },
      { id: 4, name: 'Banana' },
      { id: 1, name: 'Arch' },
      { id: 2, name: 'Aisha' }
    ]);
  });

  it('should sort numbers ascending', () => {
    sorter.addKey('id');
    sorter.addKey('id');
    sorter.sort(arr);

    expect(arr).toEqual([
      { id: 1, name: 'Arch' },
      { id: 2, name: 'Aisha' },
      { id: 3, name: 'Yoghurt' },
      { id: 4, name: 'Banana' },
      { id: 5, name: 'Jonas' },
      { id: 6, name: 'Mint' }
    ]);
  });

  it('should sort numbers descending', () => {
    sorter.addKey('id');
    sorter.sort(arr);

    expect(arr).toEqual([
      { id: 6, name: 'Mint' },
      { id: 5, name: 'Jonas' },
      { id: 4, name: 'Banana' },
      { id: 3, name: 'Yoghurt' },
      { id: 2, name: 'Aisha' },
      { id: 1, name: 'Arch' }
    ]);
  });

  it('getItemToSort returns the desired value if the key was found on the item', () => {
    const item = new AuctionItem(1);
    item.buyout = 10;
    service.mapped.value.set('1', item);

    sorter.addKey('buyout');

    expect(sorter.getItemToSort(sorter.getKey('buyout'), { item: 1 })).toBe(10);
  });

  it('getItemToSort tries to get auction item if the item did not contain the key', () => {
    const item = new AuctionItem(1);
    item.buyout = 10;
    service.mapped.value.set('1', item);

    sorter.addKey('buyout');

    expect(sorter.getItemToSort(sorter.getKey('buyout'), { item: 1 })).toBe(10);
  });
});
