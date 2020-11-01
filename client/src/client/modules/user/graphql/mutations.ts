import gql from 'graphql-tag';

export const CreateSettingsMutation = gql(`
  mutation createWahUserSettings($input: CreateWahUserSettingsInput!) {
    createWahUserSettings(input: $input) {
      id
      buyoutLimit
      craftingStrategy
      created
      customPrices
      customProcs
      lastModified
      locale
      realm
      region
      shoppingCart {
        items
        recipes
      }
      useIntermediateCrafting
      useVendorPriceForCraftingIfAvailable
    }
  }
`);

export const UpdateSettingsMutation = gql(`
  mutation updateWahUserSettings($input: UpdateWahUserSettingsInput!) {
    updateWahUserSettings(input: $input)
  }
`);

export const DeleteSettingsMutation = gql(`
  mutation deleteWahUserSettings($input: DeleteWahUserSettingsInput!) {
    deleteWahUserSettings(input: $input)
  }
`);
