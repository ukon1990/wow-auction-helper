import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {CharacterComponent} from './components/character/character.component';
import {CharactersComponent} from './components/characters.component';
import {MatButtonModule, MatCardModule, MatCheckboxModule, MatFormFieldModule, MatListModule, MatSelectModule} from '@angular/material';
import {ReactiveFormsModule} from '@angular/forms';

@NgModule({
  declarations: [CharacterComponent, CharactersComponent],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatCardModule,
    MatListModule,
    MatButtonModule
  ],
  exports: [CharacterComponent, CharactersComponent]
})
export class CharacterModule { }
