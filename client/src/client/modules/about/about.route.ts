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
import {TitledRoute} from '../../models/route/titled-route.model';

export const ABOUT_ROUTE: TitledRoute = {
    path: 'about',
    component: AboutComponent,
    children: [
      {path: '', pathMatch: 'full', redirectTo: 'what-is'},
      {
        title: 'About | What is WAH?', path: 'what-is', component: AboutWhatIsComponent},
      {
        title: 'About | Crafting', path: 'crafting', component: AboutCraftingComponent},
      {
        title: 'About | Where is the data collected from?', path: 'where-is-the-data-from', component: AboutDataComponent},
      {
        title: 'About | Privacy', path: 'privacy', component: AboutPrivacyComponent},
      {
        title: 'About | Technology', path: 'technology', component: TechnologyComponent},
      {
        title: 'About | Contributors', path: 'contributors', component: ContributorsComponent},
      {
        title: 'About | Issues', path: 'issues', component: IssuesComponent},
      {
        title: 'About | Changelog', path: 'changelog', component: ChangelogComponent}
    ]
  };
