export class AuctionV2 {
  id: number;
  item: {
    id: number;
    context: number;
    modifiers: {
      type: number;
      value: number
    }[];
    pet_breed_id: number;
    pet_level: number;
    pet_quality_id: number;
    pet_species_id: number;
    bonus_lists: number[]
  };
  buyout: number;
  quantity: number; // Quantity === 1
  time_left: string;
  bid: number; // Quantity === 1
  unit_price: number; // Quantity > 1
}
