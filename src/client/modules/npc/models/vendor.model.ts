class VendorItem {
  id: number;
  name: string;
  cost: number;
  currency: number[];
  stock: number;
}

export class Vendor {
  id: number;
  name: string;
  tag: string;
  type: string;
  react: number[];
  location: number[];
  items: VendorItem[];
  itemCount: number;
  potentialValue: number;
}
