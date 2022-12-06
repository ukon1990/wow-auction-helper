import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {CharacterComponent} from './components/character/character.component';
import {CharactersComponent} from './components/characters.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import {ReactiveFormsModule} from '@angular/forms';
import {UtilModule} from '../util/util.module';
import { SkillListComponent } from './components/character/skill-list/skill-list.component';
import {CharacterService} from './services/character.service';

@NgModule({
  declarations: [CharacterComponent, CharactersComponent, SkillListComponent],
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
  providers: [
    CharacterService
  ],
  exports: [CharacterComponent, CharactersComponent]
})
export class CharacterModule { }
