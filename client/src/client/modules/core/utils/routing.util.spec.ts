import {RoutingUtil} from './routing.util';
import {MenuItem} from '../models/menu-item.model';
import {TitledRoutes} from '../../../models/route/titled-routes.model';

fdescribe('RoutingUtil', () => {
  let routes: TitledRoutes;

  beforeEach(() => {
    routes = [
      {
        title: 'Test', path: 'test', children: [
          {title: 'Child route', path: 'child-route'}
        ]
      },
      {title: 'Conditional', path: 'conditional', isHidden: false, canActivate: []}
    ];
  });
  it('Can generate the menu from routes', () => {
    const menu: MenuItem[] = RoutingUtil.getMenu(routes);

    expect(menu[0].text).toBe('Test');
    expect(menu[0].routerLink).toBe('test');
    expect(menu[0].routerLinkFull).toBe('/test');
    expect(menu[0].children[0].text).toBe('Child route');
    expect(menu[0].children[0].title).toBe('Test | Child route');
    expect(menu[0].children[0].routerLink).toBe('child-route');
    expect(menu[0].children[0].routerLinkFull).toBe('/test/child-route');
    expect(menu[1].text).toBe('Conditional');
    expect(menu.length).toBe(2);
    routes[1].isHidden = true;
    expect(RoutingUtil.getMenu(routes).length).toBe(1);
  });

  it('can map and find the best match', () => {
    RoutingUtil.getMenu(routes);
    const route = '/test/child-route';
    const match = RoutingUtil.getCurrentRoute(route + '/1');
    expect(match.routerLinkFull).toBe(route);
  });
});
