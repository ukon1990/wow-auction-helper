import {Route} from '@angular/router';

export interface TitledRoute extends Route {
  title?: string;
  isHidden?: boolean;
}
