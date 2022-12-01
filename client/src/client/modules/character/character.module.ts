import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {CharacterComponent} from './components/character/character.component';
import {CharactersComponent} from './components/characters.component';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
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
