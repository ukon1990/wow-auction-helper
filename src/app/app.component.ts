import { Component } from '@angular/core';
import { user } from './utils/globals';
import { IUser } from './utils/interfaces';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'WAH';
  u: IUser = new IUser();

  constructor() { this.u = user; }

  ngOnInit() {
    if (this.isRealmSet()) {
      this.u.region = localStorage.getItem('region');
      this.u.realm = localStorage.getItem('realm');
      this.u.character = localStorage.getItem('character');
    }
  }

  exists(value): boolean {
    return value !== null && value !== undefined && value.length > 0;
  }

  isRealmSet(): boolean {
    return this.exists(localStorage.getItem('realm')) &&
            this.exists(localStorage.getItem('region'));
  }
}
