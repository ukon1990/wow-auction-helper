import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { User } from './models/user/user';
import { SharedService } from './services/shared.service';

@Component({
  selector: 'wah-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private _router: Router) {
    User.restore();

    if (!SharedService.user.realm || !SharedService.user.region) {
      this._router.navigateByUrl('setup');
    }
  }

  isDarkmode(): boolean {
    return SharedService.user ? SharedService.user.isDarkMode : false;
  }
}
