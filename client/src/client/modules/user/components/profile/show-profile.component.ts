import { Component, OnInit } from '@angular/core';
import {faUserCircle} from '@fortawesome/free-solid-svg-icons/faUserCircle';
import {MatDialog} from '@angular/material/dialog';
import {ProfileComponent} from './profile.component';

@Component({
  selector: 'wah-show-profile',
  template: `
    <button mat-icon-button>
      <fa-icon [icon]="profileIcon"
        (click)="openProfile()"
      ></fa-icon>
    </button>
  `
})
export class ShowProfileComponent implements OnInit {
  profileIcon = faUserCircle;
  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
  }

  openProfile() {
    this.dialog.open(ProfileComponent, {
      width: '95%',
      maxWidth: '100%',
    });
  }
}
