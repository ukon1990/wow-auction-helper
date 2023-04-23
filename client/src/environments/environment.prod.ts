import {Environment} from './environment.model';
import {environment as env} from './environment';

export const environment: Environment = {
  endOfService: env.endOfService,
  production: true,
  test: false,
  endpoints: {
    s3: 'https://s3-eu-west-1.amazonaws.com/wah-data/',
    lambdas: {
      eu: 'https://6cv84igqbc.execute-api.eu-west-1.amazonaws.com/prod/',
      us: 'https://4m6c7drle0.execute-api.us-west-2.amazonaws.com/prod/'
    }
  }
};