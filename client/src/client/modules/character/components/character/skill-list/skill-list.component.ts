import {Component, Input, OnChanges, OnDestroy, SimpleChanges} from '@angular/core';
import {ProfessionService} from '../../../../crafting/services/profession.service';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {Profession} from '@shared/models';
import {CharacterProfession} from "@shared/models";

@Component({
  selector: 'wah-skill-list',
  templateUrl: './skill-list.component.html',
})
export class SkillListComponent implements OnChanges, OnDestroy {
  @Input() characterProfession: CharacterProfession[];
  professions: { id, name, known }[] = [];
  sm = new SubscriptionManager();
  map = new Map<number, Profession>();

  constructor(private service: ProfessionService) {
    this.sm.add(service.map, (map) => {
      this.map = map;
      this.setProfessions(this.characterProfession);
    });
  }

  ngOnChanges({characterProfession}: SimpleChanges) {
    this.setProfessions(characterProfession.currentValue);
  }

  ngOnDestroy() {
    this.sm.unsubscribe();
  }

  setProfessions(professions: CharacterProfession[]): void {
    this.professions.length = 0;
    if (professions) {
      professions.forEach(p => {
        let known = 0;
        p.skillTiers.forEach(skill => {
          if (skill.recipes) {
            known += skill.recipes.length;
          }
        });
        this.professions.push({
          id: p.id,
          name: this.map && this.map.get(p.id) ? this.map.get(p.id).name : 'Unknown',
          known
        });
      });
    }
  }
}