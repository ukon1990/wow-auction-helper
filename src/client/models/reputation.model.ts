export class VendorLocation {
  id?: number;
  zone?: string;
  x?: number;
  y?: number;
}

export class ReputationVendorRecipe {
  constructor(public spellId: number,
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
      Alchemy?: ReputationVendorRecipe[];
      Blacksmithing?: ReputationVendorRecipe[];
      Cooking?: ReputationVendorRecipe[];
      Leatherworking?: ReputationVendorRecipe[];
      Mining?: ReputationVendorRecipe[];
      Tailoring?: ReputationVendorRecipe[];
      Engineering?: ReputationVendorRecipe[];
      Enchanting?: ReputationVendorRecipe[];
      Jewelcrafting?: ReputationVendorRecipe[];
      Inscription?: ReputationVendorRecipe[];
    }
  ) {
  }
}
