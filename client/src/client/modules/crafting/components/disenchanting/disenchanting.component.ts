import { Component, OnInit } from '@angular/core';
import {SharedService} from '../../../../services/shared.service';

@Component({
  selector: 'wah-disenchanting',
  templateUrl: './disenchanting.component.html',
  styleUrls: ['./disenchanting.component.scss']
})
export class DisenchantingComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    SharedService.events.title.next('Disenchanting');
  }

}
