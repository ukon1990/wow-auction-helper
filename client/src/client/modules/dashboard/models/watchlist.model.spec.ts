import {Watchlist} from './watchlist.model';
import {WatchlistItem} from './watchlist-item.model';
import {TestBed} from '@angular/core/testing';
import {AuctionsService} from '../../../services/auctions.service';
import {MockLoaderUtil} from '../../../mocks/mock-loader.util';


let wl: Watchlist,
  group,
  item = new WatchlistItem(),
  service: AuctionsService;

beforeEach(() => {
  service = MockLoaderUtil.component().auctionsService;
  wl = new Watchlist(service);
  group = 'Enchants';
  item = new WatchlistItem();
  item.itemID = 130221;
  item.name = 'Versatile Maelstrom Sapphire';
  item.compareTo = wl.COMPARABLE_VARIABLES.BUYOUT;
  item.target = 10;
  item.criteria = wl.CRITERIA.BELOW;
  item.value = 0;
});

afterEach(() => {
  Object.keys(localStorage).forEach(key => {
    delete localStorage[key];
  });
});

describe('Watchlist', () => {
  it('Can restore from localStorage', () => {
    wl.addGroup(group);
    wl.save();
    const wl2 = new Watchlist(service);
    wl2.restore();
    expect(wl2.groups.length).toBeGreaterThan(0);
  });

  it('Can add item to group', () => {
    item.itemID = 130221;
    item.name = 'Versatile Maelstrom Sapphire';
    item.compareTo = wl.COMPARABLE_VARIABLES.BUYOUT;
    item.target = 10;
    item.criteria = wl.CRITERIA.BELOW;
    item.value = 0;

    wl.addGroup(group);
    expect(wl.groupsMap['Enchants'].name).toEqual('Enchants');
    wl.addItem(group, item);
    expect(wl.groupsMap['Enchants'].items[0].itemID).toEqual(130221);

  });

  it('Can remove item from a group', () => {
    wl.addGroup(group);
    wl.addItem(wl.groupsMap['Enchants'], item);
    wl.addItem(wl.groupsMap['Enchants'], item);
    wl.addItem(wl.groupsMap['Enchants'], item);
    wl.removeItem(wl.groupsMap['Enchants'], 1);
    expect(wl.groupsMap['Enchants'].items.length).toEqual(2);
  });

  it('Can move item from a group to another', () => {
    wl.addGroup(group);
    wl.addGroup('Random');
    wl.addItem(wl.groupsMap['Enchants'], item);
    wl.addItem(wl.groupsMap['Enchants'], item);
    wl.addItem(wl.groupsMap['Enchants'], item);
    wl.moveItem(wl.groupsMap['Enchants'], wl.groupsMap['Random'], 1);
    expect(wl.groupsMap['Enchants'].items.length).toEqual(2);
    expect(wl.groupsMap['Random'].items.length).toEqual(1);
  });
});
