import {AfterContentInit, Component, Input, OnDestroy} from '@angular/core';
import {Character} from '../../../../character/models/character.model';
import {ReputationVendorsData} from '../../../../../data/reputation/reputations-list.data';
import {ColumnDescription} from '../../../../table/models/column-description';
import {SharedService} from '../../../../../services/shared.service';
import {Subscription} from 'rxjs';
import {Recipe} from '../../../../crafting/models/recipe';
import {User} from '../../../../../models/user/user';
import {CraftingUtil} from '../../../../crafting/utils/crafting.util';
import {AuctionUtil} from '../../../../auction/utils/auction.util';
import {ErrorOptions, ErrorReport} from '../../../../../utils/error-report.util';
import {CharacterService} from '../../../../../services/character.service';
import {CraftingService} from '../../../../../services/crafting.service';
import {Report} from '../../../../../utils/report.util';

@Component({
  selector: 'wah-character-reputation',
  templateUrl: './character-reputation.component.html',
  styleUrls: ['./character-reputation.component.scss']
})
export class CharacterReputationComponent implements AfterContentInit, OnDestroy {
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
    {key: 'requiredStanding', title: 'Standing', dataType: 'text'}
  ];

  subscription: Subscription;

  constructor(private characterService: CharacterService, private craftingService: CraftingService) {
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

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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
        this.addProfessionData(professionName, reputation);
      });
    });
  }

  private addProfessionData(professionName, reputation) {
    const profession = this.professionMap[professionName];
    if (profession) {
      profession.reputations.push({
        id: reputation.id,
        name: reputation.name,
        recipes: reputation.professions[professionName]
          .map(recipe => {
            return {
              itemID: this.getRecipe(recipe).itemID,
              spellId: recipe.spellId,
              name: recipe.name,
              rank: recipe.rank,
              requiredStanding: recipe.requiredStanding,
              cost: recipe.cost[0],
              isKnown: this.professionMap[professionName].knownRecipes[recipe.spellId],
              roi: this.getRecipe(recipe).roi
            };
          })
      });
    }
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

  updateCharacter(): void {
    this.character['downloading'] = true;
    this.characterService.getCharacter(
      this.character.name,
      User.slugifyString(this.character.realm),
      SharedService.user.region
    ).then(c => {
      if (!c.error) {
        Object.keys(c).forEach((key) => {
          this.character[key] = c[key];
        });
        localStorage['characters'] = JSON.stringify(SharedService.user.characters);
        User.updateRecipesForRealm();
        CraftingUtil.checkForMissingRecipes(this.craftingService);

        if (SharedService.user.region && SharedService.user.realm) {
          AuctionUtil.organize(SharedService.auctions);
        }

        Report.send('Updated', 'Characters');
        delete this.character['downloading'];
        this.mapProfessions();

      } else {
        delete this.character['downloading'];
        ErrorReport.sendHttpError(
          c.error,
          new ErrorOptions(true, 'Could not update the character'));
      }

      this.mapProfessions();
    });
  }
}
