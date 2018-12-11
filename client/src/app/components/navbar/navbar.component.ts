import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../../services/shared.service';
import { User } from '../../models/user/user';
import { UserAuctions } from '../../models/auction/user-auctions';
import { Angulartics2 } from 'angulartics2';

declare function require(moduleName: string): any;
const version = require('../../../../package.json').version;
@Component({
  selector: 'wah-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, AfterViewInit {
  appVersion = version;
  showMenu = false;

  isOffline = !navigator.onLine;

  constructor(private router: Router, private angulartics2: Angulartics2) {
    this.router.events.subscribe(change => {
      this.showMenu = false;
    });
  }

  ngOnInit() {
    console.log('App version', version);
    setInterval(() =>
      this.isOffline = !navigator.onLine, 10000);
  }

  ngAfterViewInit(): void {
    this.angulartics2.eventTrack.next({
      properties: { category: `App version ${ version }` },
    });
  }

  saveUser(evt: any): void {
    SharedService.user.isDarkMode = evt.checked;
    User.save();
  }

  isRegisteredUser(): boolean {
    if (SharedService.user.realm && SharedService.user.region) {
      return true;
    }
    return false;
  }
  isDarkMode(): boolean {
    return SharedService.user.isDarkMode;
  }

  getUserAuctions(): UserAuctions {
    return SharedService.userAuctions;
  }
}
