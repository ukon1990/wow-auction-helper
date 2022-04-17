import {AfterContentInit, Component, Input, OnDestroy} from '@angular/core';
import {Character} from '../../../../character/models/character.model';
import {ReputationVendorsData} from '../../../../../data/reputation/reputations-list.data';
import {ColumnDescription} from '../../../../table/models/column-description';
import {SharedService} from '../../../../../services/shared.service';
import {Recipe} from '../../../../crafting/models/recipe';
import {ErrorOptions, ErrorReport} from '../../../../../utils/error-report.util';
import {CharacterService} from '../../../../character/services/character.service';
import {CraftingService} from '../../../../../services/crafting.service';
import {Report} from '../../../../../utils/report.util';
import {UserUtil} from 'client/utils/user/user.util';
import {AuctionsService} from '../../../../../services/auctions.service';
import {Profession} from '@shared/models/profession/profession.model';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {ProfessionService} from '../../../../crafting/services/profession.service';
import {ReputationVendor} from '../../../../../models/reputation.model';
import {BackgroundDownloadService} from '../../../services/background-download.service';
import {CharacterProfession} from "@shared/models/character/character-profession.model";

@Component({
  selector: 'wah-character-reputation',
  templateUrl: './character-reputation.component.html',
  styleUrls: ['./character-reputation.component.scss']
})
export class CharacterReputationComponent implements AfterContentInit, OnDestroy {
  @Input() character: Character;
  reputations = ReputationVendorsData.shadowLands;
  professionMap: Map<number, Profession> = new Map<number, Profession>();
  relevantProfessions = [];
  relevantProfessionsMap = new Map<number, any>();

  columns: ColumnDescription[] = [
    {key: 'isKnown', title: 'Known', dataType: 'boolean'},
    {key: 'name', title: 'Name', dataType: 'name'},
    {key: 'rank', title: 'Rank', dataType: 'number'},
    {key: 'cost', title: 'Cost', dataType: 'vendor-currency'},
    {key: 'roi', title: 'ROI', dataType: 'gold'},
    {key: 'requiredStanding', title: 'Standing', dataType: 'text'}
  ];

  private sm = new SubscriptionManager();

  constructor(private characterService: CharacterService,
              private auctionService: AuctionsService,
              private craftingService: CraftingService,
              private backgroundService: BackgroundDownloadService,
              private professionService: ProfessionService) {
  }

  private shouldMap() {
    return this.professionService.list.value.length &&
      this.auctionService.list.value.length &&
      CraftingService.list.value.length;
  }

  ngAfterContentInit() {
    this.sm.add(this.backgroundService.isInitialLoadCompleted, isDone => {
      if (isDone) {
        this.mapProfessions();
      }
    });
  }

  ngOnDestroy(): void {
    this.sm.unsubscribe();
  }

  mapProfessions() {
    this.clearLists();

    this.organizeCharacterProfessions();

    this.combineWithReputationData();
  }

  private clearLists() {
    this.relevantProfessions.length = 0;
    this.relevantProfessionsMap.clear();
  }

  private organizeCharacterProfessions() {
    if (!this.character) {
      return;
    }
    Object.keys(this.character.professions)
      .forEach(type => {
        if (!this.character.professions) {
          return;
        }
        const charProfessions: CharacterProfession[] = this.character.professions[type];
        charProfessions.forEach((profession: CharacterProfession) => {
          const knownRecipes = new Map<number, Recipe[]>();
          (profession.skillTiers || []).forEach(skillTier => {
            this.setKnownRecipesMap(skillTier.recipes, knownRecipes);
          });
          const prof: Profession = this.professionMap.get(profession.id);

          this.relevantProfessionsMap.set(profession.id, {
            id: profession.id,
            name: prof ? prof.name : '',
            reputations: [],
            knownRecipes
          });
          this.relevantProfessions.push(
            this.relevantProfessionsMap.get(profession.id));
        });
      });
  }

  private combineWithReputationData() {
    this.reputations.forEach(reputation => {
      if (!this.isReputationMatch(reputation)) {
        return;
      }
      Object.keys(reputation.professions).forEach(id => {
        this.addProfessionData(+id, reputation);
      });
    });
  }

  private addProfessionData(id: number, reputation: ReputationVendor) {
    const profession = this.relevantProfessionsMap.get(id);
    if (profession) {
      profession.reputations.push({
        id: reputation.id,
        name: reputation.name,
        recipes: (reputation.professions[id] || [])
          .map(repRecipe => {
            const recipe: Recipe = this.getRecipe(repRecipe);
            const knownRecipes: Recipe[] = profession.knownRecipes.get(recipe.itemID) || [];
            return {
              itemID: recipe.itemID,
              id: repRecipe.id,
              name: recipe.name,
              rank: repRecipe.rank,
              requiredStanding: repRecipe.requiredStanding,
              cost: repRecipe.cost[0],
              currency: repRecipe.cost[2],
              currencyType: 'currency',
              isKnown: knownRecipes.filter(reci =>
                reci.rank >= recipe.rank && reci.name === recipe.name).length > 0,
              roi: this.getRecipe(recipe).roi
            };
          })
      });
    }
  }

  private getRecipe(recipe: Recipe) {
    return CraftingService.map.value.get(recipe.id) ?
      CraftingService.map.value.get(recipe.id) : new Recipe();
  }

  private setKnownRecipesMap(ids: number[], knownRecipes: Map<number, Recipe[]>) {
    ids.forEach(id => {
      const recipe: Recipe = CraftingService.map.value.get(id);

      if (recipe) {
        if (!knownRecipes.has(recipe.itemID)) {
          knownRecipes.set(recipe.itemID, []);
        }
        knownRecipes.get(recipe.itemID).push(recipe);
      }
    });
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
      UserUtil.slugifyString(this.character.realm),
      SharedService.user.region
    ).then(async c => {
      if (!c.error) {
        Object.keys(c).forEach((key) => {
          this.character[key] = c[key];
        });
        localStorage['characters'] = JSON.stringify(SharedService.user.characters);

        if (SharedService.user.region && SharedService.user.realm) {
          await this.auctionService.organize();
        }

        this.characterService.updateCharactersForRealmAndRecipes();
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