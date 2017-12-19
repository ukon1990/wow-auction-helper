import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { User } from '../../models/user/user';

@Component({
  selector: 'wah-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  saveUser(evt: any): void {
    SharedService.user.isDarkMode = evt.checked;
    User.save();
  }

  isDarkMode(): boolean {
    return SharedService.user.isDarkMode;
  }

}
