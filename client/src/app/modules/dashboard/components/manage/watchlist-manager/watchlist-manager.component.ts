import {Component, OnInit, OnDestroy} from '@angular/core';
import {FormBuilder, FormControl} from '@angular/forms';
import {Watchlist, WatchlistGroup} from '../../../models/watchlist.model';
import {SharedService} from '../../../../../services/shared.service';
import {ColumnDescription} from '../../../../table/models/column-description';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {AuctionsService} from '../../../../../services/auctions.service';
import {Report} from '../../../../../utils/report.util';

@Component({
  selector: 'wah-watchlist-manager',
  templateUrl: './watchlist-manager.component.html',
  styleUrls: ['./watchlist-manager.component.scss']
})
export class WatchlistManagerComponent implements OnInit, OnDestroy {
  locale = localStorage['locale'].split('-')[0];
  groupNameForm: FormControl = new FormControl();
  columns: Array<ColumnDescription> = new Array<ColumnDescription>();
  saveInterval: any;
  importString: FormControl = new FormControl();
  exportString: FormControl = new FormControl();
  importList = [];
  watchlist: Watchlist;
  sm = new SubscriptionManager();

  constructor(private _formBuilder: FormBuilder, private auctionsService: AuctionsService) {
    this.columns.push({key: 'name', title: 'Name', dataType: 'input-text'});
    this.columns.push({key: 'matchSaleRate', title: 'Min sale rate', dataType: 'input-number'});
    this.columns.push({key: 'matchDailySold', title: 'Min daily sold (region)', dataType: 'input-number'});
    this.columns.push({
      key: '',
      title: 'Actions',
      dataType: 'action',
      actions: [
        'watchlist-group-delete',
        'watchlist-group-move-up',
        'watchlist-group-move-down']
    });

    this.sm.add(
      this.importString.valueChanges,
      (change) =>
        this.handleImportStringChange(change));
    this.sm.add(
      this.auctionsService.events.groupedList,
      () => this.setWatchlist());
    this.importString.setValue('');
  }


  ngOnInit() {
    /* TODO: Do this without interval.
    this.saveInterval = setInterval(() => {
      SharedService.user.watchlist.save();
    }, 1000);*/
  }

  ngOnDestroy(): void {
    clearInterval(this.saveInterval);
    this.sm.unsubscribe();
  }

  private handleImportStringChange(change) {
    try {
      this.importList.length = 0;
      if (change) {
        const watchlist = JSON.parse(change) as Watchlist,
          newList = [],
          conflicts = [];

        watchlist.groups.forEach(group => {
          this.importList.push({
            import: this.shouldImportGroup(group),
            group: group
          });
        });
      }
    } catch (error) {
      console.error('Invalid import string', error);
    }
  }

  private shouldImportGroup(group): boolean {
    return this.watchlist.groupsMap[group.name] === undefined;
  }

  addGroup(): void {
    if (this.groupNameForm.value) {
      SharedService.user.watchlist.addGroup(this.groupNameForm.value);
      this.groupNameForm.setValue('');
      Report.send('Added new group', 'Watchlist');
    }
  }

  export(): void {
    this.exportString.setValue(JSON.stringify({groups: this.watchlist.groups}));
  }

  import(): void {
    try {
      const watchlistGroups = [];
      this.importList.forEach(i => {
        if (i.import) {
          watchlistGroups.push(i.group);
        }
      });
      const newGroupList = this.watchlist.groups.concat(watchlistGroups);
      SharedService.user.watchlist.groups.length = 0;
      newGroupList.forEach(group => {
        SharedService.user.watchlist.groupsMap[group.name] = group;
        SharedService.user.watchlist.groups.push(group);
      });
      this.importString.setValue('');
      this.importList.length = 0;
    } catch (e) {
      console.error('Could not import', e);
    }
  }

  private setWatchlist() {
    this.watchlist = SharedService.user.watchlist;
  }
}
