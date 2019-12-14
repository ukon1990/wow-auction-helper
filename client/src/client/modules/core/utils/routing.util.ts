import {appRoutes} from '../../app-routing.module';
import {TitledRoute} from '../../../models/route/titled-route.model';
import {MenuItem} from '../models/menu-item.model';

export class RoutingUtil {

  static getMenu() {
    const menuItems = [];
    appRoutes.forEach((route: TitledRoute) => {
      if (route.title && route.path) {
        const item: MenuItem = this.getMenuItem(route);
        menuItems.push(item);
      }
    });
    return menuItems;
  }

  private static getMenuItem({title, path, children}: TitledRoute, parent?: MenuItem) {
    const childMenuItems = [];
    const routerLinkFullPath: string = parent ? `${parent.routerLinkFull}/${path}` : path;
    const routeTitle = parent ? `${parent.title} | ${title}` : title;
    const menuItem: MenuItem = new MenuItem(
      title, routeTitle, childMenuItems, path, routerLinkFullPath);
    if (children) {
      children.forEach(child => {
        if (child.title) {
          childMenuItems.push(this.getMenuItem(child, menuItem));
        }
      });
    }
    return menuItem;
  }
}
