import {RoutingUtil} from './routing.util';
import {MenuItem} from '../models/menu-item.model';
import {TitledRoutes} from '../../../models/route/titled-routes.model';

fdescribe('RoutingUtil', () => {
  it('Can generate the menu from routes', () => {
    const routes: TitledRoutes = [
      {title: 'Test', path: 'test', children: [
          {title: 'Child route', path: 'child-route'}
        ]},
      {title: 'Conditional', path: 'conditional', isHidden: false, canActivate: []}
    ];

    const menu: MenuItem[] = RoutingUtil.getMenu(routes);

    expect(menu[0].text).toBe('Test');
    expect(menu[0].routerLink).toBe('test');
    expect(menu[0].routerLinkFull).toBe('test');
    expect(menu[0].children[0].text).toBe('Child route');
    expect(menu[0].children[0].title).toBe('Test | Child route');
    expect(menu[0].children[0].routerLink).toBe('child-route');
    expect(menu[0].children[0].routerLinkFull).toBe('test/child-route');
    expect(menu[1].text).toBe('Conditional');
    expect(menu.length).toBe(2);
    routes[1].isHidden = true;
    expect(RoutingUtil.getMenu(routes).length).toBe(1);
  });
});
