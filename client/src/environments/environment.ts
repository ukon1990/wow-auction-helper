// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

import {Environment} from './environment.model';

export const environment: Environment = {
  production: false,
  test: false,
  endpoints: {
    s3: 'https://s3-eu-west-1.amazonaws.com/wah-data/',
    lambdas: {
      eu: 'https://6cv84igqbc.execute-api.eu-west-1.amazonaws.com/dev/',
      us: 'https://4m6c7drle0.execute-api.us-west-2.amazonaws.com/dev/'
    }
  }
};