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
      171?: ReputationVendorRecipe[];
      164?: ReputationVendorRecipe[];
      185?: ReputationVendorRecipe[];
      165?: ReputationVendorRecipe[];
      186?: ReputationVendorRecipe[];
      197?: ReputationVendorRecipe[];
      202?: ReputationVendorRecipe[];
      333?: ReputationVendorRecipe[];
      755?: ReputationVendorRecipe[];
      773?: ReputationVendorRecipe[];
    }
  ) {
  }
}
