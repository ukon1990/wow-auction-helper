import gql from 'graphql-tag';

export const GetSettings = gql(`
  query getWahUserSettings {
    getWahUserSettings {
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
