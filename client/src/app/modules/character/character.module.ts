import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {CharacterComponent} from './components/character/character.component';
import {CharactersComponent} from './components/characters.component';
import {
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatFormFieldModule,
  MatInputModule,
  MatListModule,
  MatSelectModule, MatTooltipModule
} from '@angular/material';
import {ReactiveFormsModule} from '@angular/forms';
import {UtilModule} from '../util/util.module';

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
    MatButtonModule,
    MatInputModule,
    MatTooltipModule,
    UtilModule
  ],
  exports: [CharacterComponent, CharactersComponent]
})
export class CharacterModule { }
