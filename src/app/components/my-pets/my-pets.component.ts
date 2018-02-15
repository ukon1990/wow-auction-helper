import { Component, OnInit } from '@angular/core';
import { Pet } from '../../models/pet';
import { SharedService } from '../../services/shared.service';
import { CollectedPet } from '../../models/character/character';

@Component({
  selector: 'wah-my-pets',
  templateUrl: './my-pets.component.html',
  styleUrls: ['./my-pets.component.scss']
})
export class MyPetsComponent implements OnInit {
  petSpecies: Array<CollectedPet> = new Array<CollectedPet>();

  constructor() { }

  ngOnInit() {
    this.setUserPetMap();
    console.log('Pets', this.petSpecies);
  }


  setUserPetMap(): void {
    const tmpMap: Map<number, CollectedPet> = new Map<number, CollectedPet>();
    SharedService.user.characters.forEach(char => {
      char.pets.collected.forEach(cp => {
        tmpMap.set(cp.creatureId, cp);
      });
      console.log(tmpMap);
      tmpMap.forEach(pet => {
        this.petSpecies.push(pet);
      });
    });
  }
}
