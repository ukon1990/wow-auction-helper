import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SetupComponent } from '../components/settings/setup/setup.component';
import { CraftingComponent } from '../components/crafting/crafting.component';
import { SettingsComponent } from '../components/settings/settings.component';
import { IsRegisteredService } from '../Is-registered.service';
import { DashboardComponent } from '../components/dashboard/dashboard.component';

const routes: Routes = [
  { path: '', component: DashboardComponent, canActivate: [ IsRegisteredService ]},
  { path: 'setup', component: SetupComponent },
  { path: 'crafting', component: CraftingComponent, canActivate: [ IsRegisteredService ] },
  { path: 'settings', component: SettingsComponent, canActivate:  [ IsRegisteredService ] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
