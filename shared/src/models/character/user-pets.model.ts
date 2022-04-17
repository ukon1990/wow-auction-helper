import {CollectedPet} from "./collected-pet.model";

export interface UserPets {
  unlockedBattlePetSlots: number;
  list: CollectedPet[];
}