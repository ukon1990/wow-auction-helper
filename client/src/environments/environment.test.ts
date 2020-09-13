import {Environment} from './environment.model';
import {environment as env} from './environment';

export const environment: Environment = {
  test: true,
  ...env
};
