import { Component, OnInit } from '@angular/core';

declare function require(moduleName: string): any;
const version = require('../../../../../../package.json').version;

@Component({
  selector: 'wah-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  appVersion = version;

  constructor() { }

  ngOnInit() {
  }

}
