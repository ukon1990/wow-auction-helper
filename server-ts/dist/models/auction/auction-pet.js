"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AuctionPet {
    constructor(petSpeciesId, petLevel, petQualityId) {
        this.item = 82800;
        this.petSpeciesId = petSpeciesId;
        this.petLevel = petLevel;
        this.petQualityId = petQualityId;
        this.auctionId = `${this.item}-${this.petSpeciesId}-${this.petLevel}-${this.petQualityId}`;
    }
}
exports.AuctionPet = AuctionPet;
//# sourceMappingURL=auction-pet.js.map