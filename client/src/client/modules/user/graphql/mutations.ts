import gql from 'graphql-tag';

export const CreateSettingsMutation = gql(`
  mutation createWahUserSettings($input: CreateWahUserSettingsInput!) {
    createWahUserSettings(input: $input) {
      id
      realm
      region
      customPrices
      customProcs
      buyoutLimit
      useVendorPriceForCraftingIfAvailable
      useIntermediateCrafting
      shoppingCart {
        items
        recipes
      }
      craftingStrategy
      locale
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
      realm
      region
      customPrices
      customProcs
      buyoutLimit
      useVendorPriceForCraftingIfAvailable
      useIntermediateCrafting
      shoppingCart {
        items
        recipes
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
    }
  }
`);

export const DeleteSettingsMutation = gql(`
  mutation deleteWahUserSettings($input: DeleteWahUserSettingsInput!) {
    deleteWahUserSettings(input: $input)
  }
`);
