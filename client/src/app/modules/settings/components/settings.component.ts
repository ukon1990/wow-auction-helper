import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'wah-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {

  constructor(private _title: Title) {
    this._title.setTitle('WAH - Settings');
  }
}
