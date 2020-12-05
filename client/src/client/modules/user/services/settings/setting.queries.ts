import gql from 'graphql-tag';
import {ALL_SETTINGS_GRAPH_FIELDS} from './mutations';

export const GetSettings = gql(`
  query getWahUserSettings {
    getWahUserSettings {
      id
      ${ALL_SETTINGS_GRAPH_FIELDS}
    }
  }
`);
