import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { Watchlist } from '../../../models/watchlist/watchlist';
import { SharedService } from '../../../services/shared.service';
import { ColumnDescription } from '../../../models/column-description';
import { Item } from '../../../models/item/item';
import { Angulartics2 } from 'angulartics2';

@Component({
  selector: 'wah-watchlist-manager',
  templateUrl: './watchlist-manager.component.html',
  styleUrls: ['./watchlist-manager.component.scss']
})
export class WatchlistManagerComponent implements OnInit, OnDestroy {

  groupNameForm: FormControl = new FormControl();
  columns: Array<ColumnDescription> = new Array<ColumnDescription>();
  saveInterval: any;
  importString: FormControl = new FormControl();
  exportString: FormControl = new FormControl();

  constructor(private _formBuilder: FormBuilder, private angulartics2: Angulartics2) {
    this.columns.push({ key: 'name', title: 'Name', dataType: 'input-text' });
    this.columns.push({ key: '', title: 'Actions', dataType: 'action', actions: ['watchlist-group-delete'] });

    this.importString.setValue('');
  }

  ngOnInit() {
    this.saveInterval = setInterval(() => {
      SharedService.user.watchlist.save();
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.saveInterval);
  }

  addGroup(): void {
    if (this.groupNameForm.value) {
      SharedService.user.watchlist.addGroup(this.groupNameForm.value);
      this.groupNameForm.setValue('');
      this.angulartics2.eventTrack.next({
        action: 'Added new group',
        properties: { category: 'Watchlist' },
      });
    }
  }

  /* istanbul ignore next */
  getWatchlist(): Watchlist {
    return SharedService.user.watchlist;
  }

  export(): void {
    this.exportString.setValue(JSON.stringify({ groups: this.getWatchlist().groups }));
  }

  import(): void {
    try {
      SharedService.user.watchlist.restoreFrom(JSON.parse(this.importString.value));
      this.importString.setValue('');
    } catch (e) {
      console.error('Could not import', e);
    }
  }
}
