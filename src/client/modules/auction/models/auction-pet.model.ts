export class AuctionPet {
  item = 82800;
  petSpeciesId: number;
  petLevel: number;
  petQualityId: number;
  auctionId: string;

  constructor(petSpeciesId: number, petLevel: number, petQualityId: number) {
    this.petSpeciesId = petSpeciesId;
    this.petLevel = petLevel;
    this.petQualityId = petQualityId;
    this.auctionId = `${this.item}-${this.petSpeciesId}-${this.petLevel}-${this.petQualityId}`;
  }
}
