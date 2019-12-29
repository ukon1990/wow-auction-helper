import {Route} from '@angular/router';
import {TitledRoutes} from './titled-routes.model';

export interface TitledRoute extends Route {
  title?: string;
  isHidden?: string;
  children?: TitledRoutes;
}
