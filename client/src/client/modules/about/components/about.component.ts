import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {SharedService} from '../../../services/shared.service';

@Component({
  selector: 'wah-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  constructor() {
    SharedService.events.title.next('About');
  }

  ngOnInit() {
  }

}
