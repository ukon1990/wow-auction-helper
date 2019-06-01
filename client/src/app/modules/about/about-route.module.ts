import {Route, RouterModule} from '@angular/router';
import {AboutComponent} from './components/about.component';
import {AboutWhatIsComponent} from './components/about-what-is/about-what-is.component';
import {AboutCraftingComponent} from './components/about-crafting/about-crafting.component';
import {AboutDataComponent} from './components/about-data/about-data.component';
import {AboutPrivacyComponent} from './components/about-privacy/about-privacy.component';
import {TechnologyComponent} from './components/technology/technology.component';
import {ContributorsComponent} from './components/contributors/contributors.component';
import {IssuesComponent} from './components/issues/issues.component';
import {ChangelogComponent} from './components/changelog/changelog.component';
import {NgModule} from '@angular/core';

const route: Route = {
    path: 'about',
    component: AboutComponent,
    children: [
      {path: '', component: AboutWhatIsComponent},
      {path: 'what-is', component: AboutWhatIsComponent},
      {path: 'crafting', component: AboutCraftingComponent},
      {path: 'where-is-the-data-from', component: AboutDataComponent},
      {path: 'privacy', component: AboutPrivacyComponent},
      {path: 'technology', component: TechnologyComponent},
      {path: 'contributors', component: ContributorsComponent},
      {path: 'issues', component: IssuesComponent},
      {path: 'changelog', component: ChangelogComponent}
    ]
  };

@NgModule({
  imports: [RouterModule.forChild([route])],
  exports: [RouterModule]
})
export class AboutRouteModule {
}
