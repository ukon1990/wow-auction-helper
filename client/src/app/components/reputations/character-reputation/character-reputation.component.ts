import {AfterContentInit, Component, Input} from '@angular/core';
import {Character} from '../../../models/character/character';
import {ReputationVendorsData} from '../../../data/reputation/reputations-list.data';
import {ColumnDescription} from '../../../models/column-description';
import {SharedService} from '../../../services/shared.service';
import {Subscription} from 'rxjs';
import {Recipe} from '../../../models/crafting/recipe';

@Component({
  selector: 'wah-character-reputation',
  templateUrl: './character-reputation.component.html',
  styleUrls: ['./character-reputation.component.scss']
})
export class CharacterReputationComponent implements AfterContentInit {
  @Input() character: Character;
  reputations = ReputationVendorsData.bfa;
  professions = [];
  professionMap = new Map<string, any>();

  columns: ColumnDescription[] = [
    {key: 'isKnown', title: 'Known', dataType: 'boolean'},
    {key: 'name', title: 'Name', dataType: 'name'},
    {key: 'rank', title: 'Rank', dataType: 'number'},
    {key: 'cost', title: 'Cost', dataType: 'gold'},
    {key: 'roi', title: 'ROI', dataType: 'gold'},
    {key: 'requieredStanding', title: 'Standing', dataType: 'text'}
  ];

  subscription: Subscription;

  constructor() {
  }

  ngAfterContentInit() {
    if (SharedService.itemsUnmapped.length > 0) {
      this.mapProfessions();
    }

    this.subscription = SharedService.events
      .auctionUpdate
      .subscribe(() =>
        this.mapProfessions());
  }

  mapProfessions() {
    this.clearLists();

    this.organizeCharacterProfessions();

    this.combineWithReputationData();
  }

  private clearLists() {
    this.professions.length = 0;
    Object.keys(this.professionMap).forEach(key =>
      delete this.professionMap[key]);
  }

  private organizeCharacterProfessions() {
    Object.keys(this.character.professions)
      .forEach(type => {
        const charProfessions = this.character.professions[type];
        charProfessions.forEach(profession => {
          this.professionMap[profession.name] = {
            name: profession.name,
            reputations: [],
            knownRecipes: this.getKnownRecipesMap(profession.recipes)
          };
          this.professions.push(
            this.professionMap[profession.name]);
        });
      });
  }

  private combineWithReputationData() {
    this.reputations.forEach(reputation => {
      if (!this.isReputationMatch(reputation)) {
        return;
      }
      Object.keys(reputation.professions).forEach(professionName => {
        if (this.professionMap[professionName]) {
          this.professionMap[professionName].reputations.push({
            id: reputation.id,
            name: reputation.name,
            recipes: reputation.professions[professionName].map(recipe => {
              return {
                itemID: this.getRecipe(recipe).itemID,
                spellId: recipe.spellId,
                name: recipe.name,
                rank: recipe.rank,
                requieredStanding: recipe.requieredStanding,
                cost: recipe.cost[0],
                isKnown: this.professionMap[professionName].knownRecipes[recipe.spellId],
                roi: this.getRecipe(recipe).roi
              };
            })
          });
        }
      });
    });
  }

  private getRecipe(recipe) {
    return SharedService.recipesMap[recipe.spellId] ?
      SharedService.recipesMap[recipe.spellId] : new Recipe();
  }

  private getKnownRecipesMap(ids: number[]) {
    const map = {};
    ids.forEach(id =>
      map[id] = true);
    return map;
  }

  private isReputationMatch(reputation: any) {
    if (this.isAllyMatch(reputation) || this.isHordeMatch(reputation)) {
      return true;
    }
    return false;
  }

  private isAllyMatch(reputation: any) {
    return this.character.faction === 0 && reputation.isAlly;
  }

  private isHordeMatch(reputation: any) {
    return this.character.faction === 1 && reputation.isHorde;
  }
}
