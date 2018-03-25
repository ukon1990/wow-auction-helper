import { Component, OnInit } from '@angular/core';
import { Pet } from '../../models/pet';
import { SharedService } from '../../services/shared.service';
import { CollectedPet } from '../../models/character/character';
import { ColumnDescription } from '../../models/column-description';

@Component({
  selector: 'wah-my-pets',
  templateUrl: './my-pets.component.html',
  styleUrls: ['./my-pets.component.scss']
})
export class MyPetsComponent implements OnInit {
  petSpecies: Array<CollectedPet> = new Array<CollectedPet>();
  columns: Array<ColumnDescription> = [
    { key: 'name', title: 'Name', dataType: 'name' },
    { key: 'quantityTotal', title: 'Stock', dataType: 'number' },
    { key: 'buyout', title: 'Buyout', dataType: 'gold' },
    { key: 'bid', title: 'Bid', dataType: 'gold' },
  ];

  constructor() { }

  ngOnInit() {
    this.setUserPetMap();
    console.log('Pets', this.petSpecies);
  }

  getPets(): Array<CollectedPet> {
    return this.petSpecies.filter(p => SharedService.pets[p.stats.speciesId]);
  }


  setUserPetMap(): void {
    const tmpMap: Map<number, CollectedPet> = new Map<number, CollectedPet>();
    SharedService.user.characters.forEach(char => {
      char.pets.collected.forEach(cp => {
        if (!tmpMap[cp.creatureId]) {
          cp.count = 1;
          tmpMap.set(cp.creatureId, cp);
        } else {
          tmpMap[cp.creatureId].count++;
        }
      });
      console.log(tmpMap);
      tmpMap.forEach(pet => {
        this.petSpecies.push(pet);
      });
    });
  }

  getPet(petSpeciesId: number): Pet {
    return SharedService.pets[petSpeciesId];
  }
}
