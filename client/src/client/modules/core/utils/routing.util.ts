import {appRoutes} from '../../app-routing.module';
import {TitledRoute} from '../../../models/route/titled-route.model';
import {MenuItem} from '../models/menu-item.model';
import {TitledRoutes} from '../../../models/route/titled-routes.model';
import {Report} from '../../../utils/report.util';

export class RoutingUtil {

  static getMenu(routes?: TitledRoutes) {
    Report.debug('RoutingUtil.getMenu', appRoutes);
    const menuItems = [];
    (routes || appRoutes).forEach((route: TitledRoute) => {
      if (route.title && route.path && !route.isHidden && this.canActivate(route.canActivate)) {
        const item: MenuItem = this.getMenuItem(route);
        menuItems.push(item);
      }
    });
    return menuItems;
  }

  private static getMenuItem({title, path, children, canActivate}: TitledRoute, parent?: MenuItem) {
    const childMenuItems = [];
    const routerLinkFullPath: string = parent ? `${parent.routerLinkFull}/${path}` : path;
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
