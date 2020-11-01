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
