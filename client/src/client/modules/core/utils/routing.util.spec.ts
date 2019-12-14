import {RoutingUtil} from './routing.util';
import {MenuItem} from '../models/menu-item.model';

fdescribe('RoutingUtil', () => {
  it('Can generate the menu from appROutes', () => {
    const menu: MenuItem[] = RoutingUtil.getMenu();
    console.log('Menu is', menu);

    expect(menu[0].text).toBe('Dashboard');
    expect(menu[0].children[0].text).toBe('Item');
    expect(menu[0].children[0].title).toBe('Dashboard | Item');
    expect(menu.length).toBe(8);
  });
});
