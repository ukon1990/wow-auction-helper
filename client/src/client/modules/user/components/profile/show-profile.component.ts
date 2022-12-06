import {Component, OnDestroy, OnInit} from '@angular/core';
import {faUserCircle} from '@fortawesome/free-solid-svg-icons/faUserCircle';
import {MatDialog} from '@angular/material/dialog';
import {ProfileComponent} from './profile.component';
import {AuthService} from '../../services/auth.service';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {faSignInAlt} from '@fortawesome/free-solid-svg-icons/faSignInAlt';

@Component({
  selector: 'wah-show-profile',
  template: `
    <ng-container *ngIf="isAuthenticated; else loginTemplate">
      <button mat-icon-button
              matTooltip="Sign out or look at your user profile"
              (click)="openProfile()"
      >
        <fa-icon [icon]="profileIcon"
        ></fa-icon>
      </button>
    </ng-container>

    <ng-template #loginTemplate>
      <button mat-icon-button
              matTooltip="Sign in an existing or register a new user"
              (click)="openSignIn()"
      >
        <fa-icon [icon]="signInIcon"
        ></fa-icon>
      </button>
    </ng-template>
  `
})
export class ShowProfileComponent implements OnInit, OnDestroy {
  profileIcon = faUserCircle;
  signInIcon = faSignInAlt;
  isAuthenticated: boolean;
  sm = new SubscriptionManager();
  constructor(private dialog: MatDialog, private authService: AuthService) {
  }

  ngOnInit(): void {
    this.sm.add(this.authService.isAuthenticated,
        isAuthenticated => this.isAuthenticated = isAuthenticated);
  }

  ngOnDestroy() {
    this.sm.unsubscribe();
  }

  openProfile() {
    this.dialog.open(ProfileComponent, {
      width: '95%',
      maxWidth: '100%',
    });
  }

  openSignIn() {
    this.authService.openLoginComponent.emit(true);
  }
}
