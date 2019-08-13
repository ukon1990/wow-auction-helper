import {Component, OnDestroy, OnInit} from '@angular/core';
import {SharedService} from '../../../services/shared.service';
import {CollectedPet} from '../../character/models/character.model';
import {ColumnDescription} from '../../table/models/column-description';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {AuctionsService} from '../../../services/auctions.service';
import {PageEvent} from '@angular/material';
import {Report} from '../../../utils/report.util';
import {PetTableData} from '../models/pet-table-data.model';

@Component({
  selector: 'wah-my-pets',
  templateUrl: './pets-value.component.html',
  styleUrls: ['./pets-value.component.scss']
})
export class PetsValueComponent implements OnInit, OnDestroy {
  isDownloadingAHData = true;
  petSpecies: CollectedPet[] = [];
  pets: CollectedPet[] = [];
  petAuctionsMap = {};
  columns: Array<ColumnDescription> = [
    {key: 'name', title: 'Name', dataType: 'name'},
    {key: 'quantityTotal', title: 'Stock', dataType: 'number'},
    {key: 'buyout', title: 'Buyout', dataType: 'gold'},
    {key: 'bid', title: 'Bid', dataType: 'gold'},
  ];
  sm = new SubscriptionManager();
  table = {
    columns: [
      {key: 'name', title: 'Name', dataType: 'name'},
      {key: 'userStock', title: 'Your Stock', dataType: 'number'},
      {key: 'ahStock', title: 'AH stock', dataType: 'number'},
      {key: 'totalBuyout', title: 'Sum min buyout', dataType: 'gold'},
      {key: 'minBuyout', title: 'Min buyout', dataType: 'gold'},
      {key: 'avgBuyout', title: 'Avg buyout', dataType: 'gold'},
      {key: 'maxBuyout', title: 'Max buyout', dataType: 'gold'}
    ],
    data: []
  };

  pageRows: Array<number> = [10, 20, 40, 80, 100];
  itemsPerPage = 12;
  pageEvent: PageEvent = {pageIndex: 0, pageSize: this.itemsPerPage, length: 0};

  petValue = 0;

  constructor(private ahService: AuctionsService) {
  }

  ngOnInit() {
    this.sm.add(SharedService.events.auctionUpdate,
      () => this.handleAHUpdate());

    this.sm.add(this.ahService.events.isDownloading,
        isDownloading =>
      this.isDownloadingAHData = isDownloading);
  }

  ngOnDestroy(): void {
    this.sm.unsubscribe();
  }

  setUserPets(): void {
    this.petSpecies.length = 0;
    this.pets.length = 0;
    this.petAuctionsMap = {};
    const tmpMap: Map<number, CollectedPet> = new Map<number, CollectedPet>();
    SharedService.user.characters.forEach(char => {
      if (!char || !char.pets || !char.pets.collected) {
        return;
      }
      char.pets.collected.forEach(cp => {
        const pet = SharedService.pets[cp.stats.speciesId];
        if (!pet || !pet.auctions || !pet.auctions.length) {
          return;
        }
        if (!tmpMap[cp.creatureId]) {
          cp.count = 1;
          tmpMap.set(cp.creatureId, cp);
          this.petAuctionsMap[cp.stats.speciesId] = pet && pet.auctions ? pet.auctions : [];
        } else {
          tmpMap[cp.creatureId].count++;
        }
      });

    });

    Report.debug('PetsValueComponent.setUserPets', {tmpMap, species: this.petSpecies, auctionMap: this.petAuctionsMap});
    tmpMap.forEach(pet => {
      this.petSpecies.push(pet);
    });

    this.table.data = [];
    this.petValue = 0;
    this.petSpecies.forEach((species: CollectedPet) => {
      const pet = new PetTableData(species, this.petAuctionsMap[species.stats.speciesId]);
      this.table.data.push(pet);
      this.petValue += pet.minBuyout * pet.userStock;
    });
    Report.debug('setUserPets', this.table);
  }

  /* istanbul ignore next */
  pageChange(event: PageEvent): void {
    this.pageEvent = event;
  }

  /* istanbul ignore next */
  getFromValue(): number {
    if (!this.pageEvent || !this.pageEvent.pageSize) {
      return 0;
    }
    return (this.pageEvent.pageSize * (this.pageEvent.pageIndex + 1)) - this.pageEvent.pageSize;
  }

  /* istanbul ignore next */
  getToValue(): number {
    if (!this.pageEvent || !this.pageEvent.pageSize) {
      return this.pageRows[0];
    }

    return this.pageEvent.pageSize * (this.pageEvent.pageIndex + 1);
  }

  private handleAHUpdate(): void {
    // this.petSpecies.filter(p => SharedService.pets[p.stats.speciesId]);
    this.setUserPets();
  }
}
