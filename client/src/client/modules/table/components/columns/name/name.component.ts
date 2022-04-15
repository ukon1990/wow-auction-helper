import {Component, Input, OnInit} from '@angular/core';
import {BaseComponent} from '../base.component';
import {Profession} from '../../../../../../../../api/src/profession/model';
import {Recipe} from '../../../../crafting/models/recipe';
import {CraftingService} from '../../../../../services/crafting.service';
import {SharedService} from '../../../../../services/shared.service';
import {ItemService} from '../../../../../services/item.service';
import {Report} from '../../../../../utils/report.util';
import {AuctionPet} from '../../../../auction/models/auction-pet.model';
import {TableUtil} from '../../../utils/table.util';
import {AuctionsService} from '../../../../../services/auctions.service';
import {Item} from '@shared/models';
import {PetsService} from '../../../../../services/pets.service';
import {Pet} from '../../../../pet/models/pet';
import {Router} from '@angular/router';

@Component({
  selector: 'wah-name',
  templateUrl: './name.component.html'
})
export class NameComponent extends BaseComponent implements OnInit {
  @Input() isCrafting: boolean;
  @Input() hideCraftingDetails: boolean;
  @Input() professionIds: Map<number, Profession>;
  @Input() linkType: string;
  @Input() iconSize: number;
  @Input() useAuctionItemForName: boolean;

  itemId: number;
  creatureId: number;
  name: string;
  subName: string;
  knownBy: string;
  profession: string;
  routerLink: string;
  relData: string;

  constructor(
    private auctionService: AuctionsService,
    private itemService: ItemService,
    private petService: PetsService,
    private router: Router) {
    super();
  }


  ngOnInit(): void {
    this.itemId = TableUtil.getItemID(this.row, this.column, this.idName);
    this.setName();
    this.setSubNameOrNameIfMissing();
    this.setCreatureId();
    this.setRecipeKnownBy();
    this.routerLink = this.getRouterLink();
    this.relData = this.getRelData();
  }

  private setRecipeKnownBy() {
    if (CraftingService.recipesForUser.value.has(this.row.id)) {
      this.knownBy = CraftingService.recipesForUser.value.get(this.row.id).join(', ');
    }
  }

  private setCreatureId() {
    if (this.row.petSpeciesId && SharedService.pets[this.row.petSpeciesId]) {
      this.creatureId = SharedService.pets[this.row.petSpeciesId].creatureId;
    }
  }

  private setName() {
    if (this.useAuctionItemForName && this.row.petSpeciesId) {
      const petId = `${this.row.item}-${this.row.petSpeciesId}-${this.row.petLevel}-${this.row.petQualityId}`;
      if (this.auctionService.getById(petId)) {
        this.name = this.auctionService.getById(petId).name;
      } else {
        const pet: Pet = this.petService.mapped.value.get(this.row.petSpeciesId);
        this.name = pet ? pet.name : '';
      }
    }

    if (!this.name && this.row[this.column.key]) {
      this.name = this.row[this.column.key];
    } else {
      const item: Item = ItemService.mapped.value.get(+this.itemId);
      this.name = item ? item.name : '';
    }
  }

  getSource(recipe: Recipe): number {
    return recipe.professionId || 0;
  }

  /* istanbul ignore next */
  setSelectedPet(pet: any) {
    if (pet.petSpeciesId) {
      const id = new AuctionPet(pet.petSpeciesId, pet.petLevel, pet.petQualityId);
      // SharedService.selectedPetSpeciesId = id;
    }
  }

  /* istanbul ignore next */
  setSelectedItem(): void {
    SharedService.preScrollPosition = window.scrollY;
    if (this.column.options && this.column.options.idName) {
      SharedService.events.detailSelection.emit(
        ItemService.mapped.value.get(this.row[this.column.options.idName])
      );
    } else {
      SharedService.events.detailSelection.emit(this.row);
    }
    this.setSelectedPet(this.row);
    SharedService.events.detailPanelOpen.emit(true);
    Report.debug('clicked', this.row);
  }

  select(): void {
    const type = this.getColumnLinkType();

    if (this.idName === 'name') {
    } else {
      switch (type) {
        case 'npc':
          window.scroll(0, 0);
          break;
        case 'zone':
          break;
        case 'item':
        default:
          this.setSelectedItem();
          break;
      }
    }
  }

  private getColumnLinkType() {
    return this.column.options && this.column.options.tooltipType || this.linkType;
  }

  getRouterLink(): string {
    const type = this.getColumnLinkType();
    switch (type) {
      case 'npc':
        const id = this.column.options && this.column.options.idName || this.idName;
        return `/tools/npc/${this.row[id]}`;
      case 'zone':
      case 'item':
      default:
        try {
          return this.router.url;
        } catch (e) {
          return '.';
        }
    }
  }

  /**
   * Gets a string of the relevant relations for an item
   *
   * @param {*} item
   * @param column
   * @returns {string}
   * @memberof DataTableComponent
   */
  getWHRelations(): string {
    if (this.row.petSpeciesId || this.row.speciesId) {
      return 'npc=' + (this.row.creatureId ? this.row.creatureId : this.creatureId);
    }
    const type = this.getColumnLinkType();
    return (type ?
      `${type}=` : 'item=') + this.itemId;
  }

  getRelData() {
    const whRelations = this.getWHRelations(),
      bonusIds = (this.row.bonusIds || []).join(':');
    const result = [];
    if (this.locale) {
      result.push(`domain=${this.locale}`);
    }
    if (bonusIds) {
      result.push(`bonus=${bonusIds}`);
    }

    if (whRelations) {
      result.push(whRelations);
    }
    return result.join(',');
  }

  private setSubNameOrNameIfMissing() {
    // TODO!: ItemService.items.value.get()
  }
}