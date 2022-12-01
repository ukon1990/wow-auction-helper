import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PetsValueComponent} from './components/pets-value.component';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import {IconModule} from '../icon/icon.module';
import {TableModule} from '../table/table.module';
import {UtilModule} from '../util/util.module';
import {CharacterModule} from '../character/character.module';

@NgModule({
  declarations: [
    PetsValueComponent],
  imports: [
    CommonModule,
    MatCardModule,
    IconModule,
    TableModule,
    MatPaginatorModule,
    UtilModule,
    CharacterModule
  ]
})
export class PetModule {
}
