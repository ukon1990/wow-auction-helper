import {Component, OnInit} from '@angular/core';
import {AdminService} from '../../services/admin.service';
import {AuctionHouseStatus} from '../../../auction/models/auction-house-status.model';
import {ColumnDescription} from '@shared/models';

@Component({
  selector: 'wah-realm',
  templateUrl: './realm.component.html'
})
export class RealmComponent implements OnInit {
  columns: ColumnDescription[] = [
    {key: 'id', title: 'Id', dataType: 'number'},
    {key: 'connectedId', title: 'Connected Id', dataType: 'number'},
    {key: 'gameBuild', title: 'Game build', dataType: 'string'},
    {key: 'region', title: 'Region', dataType: 'text'},
    {key: 'realmSlugs', title: 'Realm slugs', dataType: 'text'},
    {key: 'updateAttempts', title: 'Update attempts', dataType: 'number'},
    {key: 'lastModified', title: 'Last updated', dataType: 'date'},
    {key: 'lastStatsInsert', title: 'Last stats update', dataType: 'date'},
    {key: 'nextUpdate', title: 'Next update check', dataType: 'date'},
    {key: 'lastDailyPriceUpdate', title: 'Daily price update', dataType: 'date'},
    {key: 'lastHistoryDeleteEvent', title: 'Hourly price deletion', dataType: 'date'},
    {key: 'lastHistoryDeleteEventDaily', title: 'Daily price deletion', dataType: 'date'},
    {key: 'firstRequested', title: 'First requested', dataType: 'date'},
    {key: 'lastRequested', title: 'Last requested', dataType: 'date'},
    {
      key: '',
      title: 'Update',
      dataType: 'row-actions'
      , actions: [{
        icon: 'fa fa-download',
        text: 'Update',
        tooltip: 'Manually update an auction house',
        callback: (house: AuctionHouseStatus, index) => this.service.updateHouse(house),
      }, {
        icon: 'fa fa-download',
        text: 'Stats',
        tooltip: 'Manually stats for an auction house',
        callback: (house: AuctionHouseStatus, index) => this.service.updateHouseStats(house),
      }, {
        icon: 'fa fa-download',
        text: 'Inserts',
        tooltip: 'Manually stats for an auction house',
        callback: (house: AuctionHouseStatus, index) => this.service.updateHouseStats(house),
      }]
    },
  ];
  houses: AuctionHouseStatus[] = [];
  tableData: AuctionHouseStatus[] = [];
  isLoading = false;

  constructor(public service: AdminService) {
    this.getAllAuctionHouses();
  }

  getAllAuctionHouses() {
    this.isLoading = true;
    this.service.getAllHouses()
      .then(houses => {
        this.houses = houses;
        this.tableData = houses;
        console.log('Houses', houses);
      })
      .catch(console.error)
      .finally(() => this.isLoading = false);
  }

  ngOnInit(): void {
  }

}