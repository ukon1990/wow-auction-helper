import {appRoutes} from '../../app-routing.module';
import {TitledRoute} from '../../../models/route/titled-route.model';
import {MenuItem} from '../models/menu-item.model';
import {TitledRoutes} from '../../../models/route/titled-routes.model';

export class RoutingUtil {
  private static map = {};
  private static list = [];

  static getCurrentRoute(path: string): MenuItem {
    if (!this.list.length) {
      RoutingUtil.getMenu();
    }
    if (!path || !this.list) {
      return undefined;
    }
    const parts = path.split('/');
    return this.queryForMatchingParts(this.list, parts);
  }

  private static queryForMatchingParts(list: MenuItem[], parts: string[], partIndex: number = 1): MenuItem {
    for (let i = 0; i < list.length; i++) {
      const menuItem: MenuItem = list[i];
      if (menuItem.routerLink === parts[partIndex]) {
        if (menuItem.children.length > 0 && partIndex < parts.length) {
          const childMatch = this.queryForMatchingParts(menuItem.children, parts, ++partIndex);
          return childMatch || menuItem;
        }
        return menuItem;
      }
    }
    return undefined;
  }

  static getMenu(routes?: TitledRoutes) {
    const menuItems = [];
    (routes || appRoutes).forEach((route: TitledRoute) => {
      if ((route.title || route.children) && route.path && !route.isHidden && this.canActivate(route.canActivate)) {
        const item: MenuItem = this.getMenuItem(route);
        menuItems.push(item);
      }
    });
    this.list = menuItems;
    return menuItems;
  }

  private static getMenuItem({title, path, children, canActivate}: TitledRoute, parent?: MenuItem) {
    const childMenuItems = [];
    const routerLinkFullPath: string = parent ? `${parent.routerLinkFull}/${path}` : '/' + path;
    const routeTitle = parent ? `${parent.title} | ${title}` : title;
    const menuItem: MenuItem = new MenuItem(
      title, routeTitle, childMenuItems, path, routerLinkFullPath);
    if (children) {
      children.forEach(child => {
        if (child.title && !child.isHidden && this.canActivate(child.canActivate)) { // Use Can activate also
          childMenuItems.push(this.getMenuItem(child, menuItem));
        }
      });
    }
    this.map[routerLinkFullPath] = menuItem;
    return menuItem;
  }

  private static canActivate(canActivate: Function[]): boolean {
    /* Todo: See if this can be solved...
    if (canActivate) {
      for (let i = 0; i < canActivate.length; i++) {
        console.log('route canActivate', canActivate[i]());
        if (!canActivate[i]()) {
          return false;
        }
      }
    }*/
    return true;
  }
}
