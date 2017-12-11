import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SetupComponent } from '../components/settings/setup/setup.component';
import { CraftingComponent } from '../components/crafting/crafting.component';
import { SettingsComponent } from '../components/settings/settings.component';

const routes: Routes = [
  { path: 'setup', component: SetupComponent },
  { path: 'crafting', component: CraftingComponent },
  { path: 'settings', component: SettingsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
