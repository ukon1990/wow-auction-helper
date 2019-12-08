import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {SharedService} from '../../../services/shared.service';

@Component({
  selector: 'wah-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {

  constructor() {
    SharedService.events.title.next('Settings');
  }
}
