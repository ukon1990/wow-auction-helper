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
    title: 'About',
    path: 'about',
    component: AboutComponent,
    children: [
      {path: '', pathMatch: 'full', redirectTo: 'what-is'},
      {
        title: 'What is WAH?', path: 'what-is', component: AboutWhatIsComponent},
      {
        title: 'Crafting', path: 'crafting', component: AboutCraftingComponent},
      {
        title: 'Where is the data collected from?', path: 'where-is-the-data-from', component: AboutDataComponent},
      {
        title: 'Privacy', path: 'privacy', component: AboutPrivacyComponent},
      {
        title: 'Technology', path: 'technology', component: TechnologyComponent},
      {
        title: 'Contributors', path: 'contributors', component: ContributorsComponent},
      {
        title: 'Issues', path: 'issues', component: IssuesComponent},
      {
        title: 'Changelog', path: 'changelog', component: ChangelogComponent}
    ]
  };
