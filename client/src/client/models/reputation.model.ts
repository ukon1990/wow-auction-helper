export class VendorLocation {
  id?: number;
  zone?: string;
  x?: number;
  y?: number;
}

export class ReputationVendorRecipe {
  constructor(public id: number,
              public name: string,
              public rank: number,
              public cost: number[],
              public requiredStanding: string) {

  }
}

export class Vendor {
  constructor(
    public name: string,
    public isAlly: boolean,
    public isHorde: boolean,
    public locations: VendorLocation[],
    public id?: number
  ) {}
}

export class ReputationVendor {
  constructor(
    public id: number,
    public name: string,
    public expansion: number,
    public isAlly: boolean,
    public isHorde: boolean,
    public vendors: Vendor[],
    public professions: {
      171?: ReputationVendorRecipe[]; // Alchemy
      164?: ReputationVendorRecipe[]; // Blacksmithing
      185?: ReputationVendorRecipe[]; // Cooking
      165?: ReputationVendorRecipe[]; // Leatherworking
      186?: ReputationVendorRecipe[]; // Mining
      197?: ReputationVendorRecipe[]; // Tailoring
      202?: ReputationVendorRecipe[]; // Engineering
      333?: ReputationVendorRecipe[]; // Enchanting
      755?: ReputationVendorRecipe[]; // Jewelcrafting
      773?: ReputationVendorRecipe[]; // Inscription
    }
  ) {
  }
}
