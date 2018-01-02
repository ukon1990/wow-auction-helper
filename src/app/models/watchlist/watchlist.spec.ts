import { async, TestBed } from '@angular/core/testing';
import { SharedService } from '../../services/shared.service';
import { Watchlist, WatchlistItem, WatchlistGroup } from './watchlist';

beforeEach(() => {

});

afterEach(() => {
  Object.keys(localStorage).forEach(key => {
    delete localStorage[key];
  });
});

describe('Watchlist', () => {
  it('Can restore from localStorage', () => {
    const wl = new Watchlist(),
      group = new WatchlistGroup('Enchants');

    wl.addGroup(group);
    console.log(wl, group, localStorage['watchlist']);
    wl.save();
    const wl2 = new Watchlist();
    wl2.restore();
    expect(wl2.groups.length).toBeGreaterThan(0);
  });

  it('Can add item to group', () => {
    const wl = new Watchlist(),
      group = new WatchlistGroup('Enchants'),
      item = new WatchlistItem();
    item.itemID = 130221;
    item.name = 'Versatile Maelstrom Sapphire';
    item.compareTo = wl.COMPARABLE_VARIABLES.BUYOUT;
    item.target = 10;
    item.criteria = wl.CRITERIAS.BELOW;
    item.value = 0;

    wl.addGroup(group);
    expect(wl.groupsMap['Enchants'].name).toEqual('Enchants');
    wl.addItem(group, item);
    expect(wl.groupsMap['Enchants'].items[0].itemID).toEqual(130221);

  });

  it('Can remove item from a group', () => {
    const wl = new Watchlist(),
    group = new WatchlistGroup('Enchants'),
    item = new WatchlistItem();
    item.itemID = 130221;
    item.name = 'Versatile Maelstrom Sapphire';
    item.compareTo = wl.COMPARABLE_VARIABLES.BUYOUT;
    item.target = 10;
    item.criteria = wl.CRITERIAS.BELOW;
    item.value = 0;

    wl.addGroup(group);
    wl.addItem(wl.groupsMap['Enchants'], item);
    wl.addItem(wl.groupsMap['Enchants'], item);
    wl.addItem(wl.groupsMap['Enchants'], item);
    expect(wl.groupsMap['Enchants'].items.length).toEqual(3);
    wl.removeItem(wl.groupsMap['Enchants'], 1);
    expect(wl.groupsMap['Enchants'].items.length).toEqual(2);
  });

  it('Can move item from a group to another', () => {

  });
});
