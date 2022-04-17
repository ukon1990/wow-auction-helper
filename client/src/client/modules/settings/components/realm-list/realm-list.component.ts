import {Component} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {RealmListDialogComponent} from './realm-list-dialog/realm-list-dialog.component';

@Component({
  selector: 'wah-realm-list',
  templateUrl: './realm-list.component.html',
  styleUrls: ['./realm-list.component.scss']
})
export class RealmListComponent {

  constructor(public dialog: MatDialog) {
  }

  toggle(): void {
    this.dialog.open(RealmListDialogComponent, {
      width: '95%',
      maxWidth: '100%'
    });
  }
}