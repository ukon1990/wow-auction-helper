import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-character',
  templateUrl: './character.component.html'
})
export class CharacterComponent {
  @Input() index: number;
  @Input() character: Object;


  removeCharacter(index: number): void {
    console.log('deleted');
    /*this.user.characters.splice(index, 1);
    this.updateRecipesForRealm();
    localStorage.characters = JSON.stringify(this.user.characters);*/
  }
}
