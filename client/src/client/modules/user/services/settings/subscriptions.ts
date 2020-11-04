import gql from 'graphql-tag';
import {ALL_SETTINGS_GRAPH_FIELDS} from './mutations';

export const CreateSettingsSubscription = gql(`
  subscription onCreateWahUserSettings {
    onCreateWahUserSettings {
      ${ALL_SETTINGS_GRAPH_FIELDS}
    }
  }
`);

export const UpdateSettingsSubscription = gql(`
  subscription onUpdateWahUserSettings {
    onUpdateWahUserSettings {
      realm
      region
      faction
    }
  }
`);
export const DeleteSettingsSubscription = gql(`
  subscription onDeleteWahUserSettings {
    onDeleteWahUserSettings {
      ${ALL_SETTINGS_GRAPH_FIELDS}
    }
  }
`);
