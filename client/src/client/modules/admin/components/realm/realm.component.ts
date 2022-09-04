import {Component, OnInit} from '@angular/core';
import {AdminService} from '../../services/admin.service';
import {AuctionHouseStatus} from '../../../auction/models/auction-house-status.model';
import {ColumnDescription} from '@shared/models';

@Component({
  selector: 'wah-realm',
  templateUrl: './realm.component.html'
})
export class RealmComponent implements OnInit {
  /**
   * avgDelay: 62
   * battlegroup: "Vindication"
   * connectedId: 67
   * firstRequested: 1593837459989
   * highestDelay: 98
   * id: 187
   * lastDailyPriceUpdate: 1662278755581
   * lastHistoryDeleteEvent: 1662275776547
   * lastHistoryDeleteEventDaily: 1660644504546
   * lastModified: 1662281282826
   * lastRequested: 1660680497227
   * lastStatsInsert: 1662281282826
   * lastTrendUpdateInitiation: 1662244117767
   * lowestDelay: 60
   * nextUpdate: 1662302866831
   */
  columns: ColumnDescription[] = [
    {key: 'id', title: 'Id', dataType: 'number'},
    {key: 'connectedId', title: 'Connected Id', dataType: 'number'},
    {key: 'gameBuild', title: 'Game build', dataType: 'number'},
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
  ];
  houses: AuctionHouseStatus[] = [];
  tableData: AuctionHouseStatus[] = [];
  isLoading = false;

  constructor(private service: AdminService) {
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