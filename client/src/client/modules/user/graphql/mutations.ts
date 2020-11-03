import gql from 'graphql-tag';

export const ALL_SETTINGS_GRAPH_FIELDS = `
  realm
  region
  customPrices
  customProcs
  buyoutLimit
  useVendorPriceForCraftingIfAvailable
  useIntermediateCrafting
  shoppingCart {
    items {
      id
      isIntermediate
      quantity
    }
    recipes {
      id
      isIntermediate
      quantity
    }
  }
  craftingStrategy
  locale
  lastModified
  created
  characters {
    lastModified
    name
    slug
  }
`;

export const CreateSettingsMutation = gql(`
  mutation createWahUserSettings($input: CreateWahUserSettingsInput!) {
    createWahUserSettings(input: $input) {
      id
      ${ALL_SETTINGS_GRAPH_FIELDS}
      lastModified
      created
    }
  }
`);
/**
 * TODO: Make it so that it generates the return values so that we save bandwidth
 * @param keys
 * @constructor
 */
export const UpdateSettingsMutation = (keys: string[]) => gql(`
  mutation updateWahUserSettings($input: UpdateWahUserSettingsInput!) {
    updateWahUserSettings(input: $input) {
      ${ALL_SETTINGS_GRAPH_FIELDS}
    }
  }
`);

export const DeleteSettingsMutation = gql(`
  mutation deleteWahUserSettings($input: DeleteWahUserSettingsInput!) {
    deleteWahUserSettings(input: $input)
  }
`);
