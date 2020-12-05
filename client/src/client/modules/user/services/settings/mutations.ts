import gql from 'graphql-tag';

export const ALL_SETTINGS_GRAPH_FIELDS = `
  realm
  region
  faction
  customPrices
  customProcs
  buyoutLimit
  useVendorPriceForCraftingIfAvailable
  useIntermediateCrafting
  craftingStrategy
  locale
  dashboards {
    id
    parentId
    idParam
    title
    description
    tags
    columns
    sortOrder
    isDisabled
    isDefault
    onlyItemsWithRules
    sortRule
    rules
    itemRules
    isPublic
    createdBy
    createdById
    lastModified
    idIsBackendGenerated
  }
  characters {
    lastModified
    name
    slug
  }
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
  lastModified
  created
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
export const UpdateSettingsMutation = (fields = ALL_SETTINGS_GRAPH_FIELDS) => gql(`
  mutation updateWahUserSettings($input: UpdateWahUserSettingsInput!) {
    updateWahUserSettings(input: $input) {
      ${fields}
    }
  }
`);

export const DeleteSettingsMutation = gql(`
  mutation deleteWahUserSettings($input: DeleteWahUserSettingsInput!) {
    deleteWahUserSettings(input: $input)
  }
`);
