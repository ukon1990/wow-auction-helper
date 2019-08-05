import {Component, OnInit} from '@angular/core';
import {SharedService} from '../../../../../services/shared.service';

@Component({
  selector: 'wah-character-select',
  templateUrl: './character-select.component.html',
  styleUrls: ['./character-select.component.scss']
})
export class CharacterSelectComponent implements OnInit {

  list = [];

  constructor() {
  }

  ngOnInit() {
    console.log(SharedService.realms, SharedService.user, SharedService.userRealms);
  }


  private setList(): void {
    const map = {};
    this.list.length = 0;


    SharedService.user.characters.forEach(char => {
      if (!map[char.realm]) {
        map[char.realm] = [];
      }
    });
  }
}
