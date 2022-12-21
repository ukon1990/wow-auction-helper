export class BaseFilterModel {
  constructor(private storageKey: string) {
    this.restore();
  }

  private restore() {
    if (!localStorage) {
      return;
    }
    const entry = localStorage.getItem(this.storageKey);
    try {
      if (entry) {
        const query: CraftingFormFilterModel = JSON.parse(entry);
        Object.keys(query).forEach(key => {
          const value = query[key];
          if (isNaN(value)) {
            this[key] = value;
            return;
          }
          if (value === 'true' || value === 'false') {
            this[key] = value === 'true';
          }
          this[key] = +query[key];
        });
      }
    } catch (error) {
      console.error('Could not restore query', error);
    }
  }

  save(filter: this): void {
    localStorage.setItem(this.storageKey, JSON.stringify(filter));
  }
}

export class CraftingFormFilterModel extends BaseFilterModel {
  searchQuery = '';
  onlyKnownRecipes = false;
  professionId = 0;
  rank = 0;
  profit: number | null = null;
  demand: number | null = null;
  personalSaleRate: number | null = null;
  minSold: number | null = null;
  itemClass = -1;
  itemSubClass = -1;
  expansion: number;

  constructor() {
    super('query_crafting');
  }
}