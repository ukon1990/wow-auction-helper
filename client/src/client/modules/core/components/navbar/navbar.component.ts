import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../../../../services/shared.service';
import { UserAuctions } from '../../../auction/models/user-auctions.model';
import {UserUtil} from '../../../../utils/user/user.util';

declare function require(moduleName: string): any;
const version = require('../../../../../../package.json').version;
@Component({
  selector: 'wah-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, AfterViewInit {
  appVersion = version;
  showMenu = false;

  isOffline = !navigator.onLine;

  constructor(private router: Router) {
    this.router.events.subscribe(change => {
      this.showMenu = false;
    });
  }

  ngOnInit() {
    setInterval(() =>
      this.isOffline = !navigator.onLine, 10000);
  }

  ngAfterViewInit(): void {
  }

  saveUser(evt: any): void {
    SharedService.user.isDarkMode = evt.checked;
    UserUtil.save();
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
