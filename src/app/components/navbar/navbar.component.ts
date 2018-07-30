import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../../services/shared.service';
import { User } from '../../models/user/user';
import { UserAuctions } from '../../models/auction/user-auctions';

declare function require(moduleName: string): any;
const version = require('../../../../package.json').version;
@Component({
  selector: 'wah-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  appVersion = version;
  showMenu = false;

  constructor(private router: Router) {
    this.router.events.subscribe(change => {
      this.showMenu = false;
    });
  }

  ngOnInit() {
    console.log('App version', version);
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
