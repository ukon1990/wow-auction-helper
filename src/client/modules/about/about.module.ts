import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AboutComponent} from './components/about.component';
import {TechnologyComponent} from './components/technology/technology.component';
import {NewsComponent} from './components/news/news.component';
import {IssuesComponent} from './components/issues/issues.component';
import {ContributorsComponent} from './components/contributors/contributors.component';
import {ChangelogComponent} from './components/changelog/changelog.component';
import {AboutWhatIsComponent} from './components/about-what-is/about-what-is.component';
import {AboutPrivacyComponent} from './components/about-privacy/about-privacy.component';
import {AboutDataComponent} from './components/about-data/about-data.component';
import {AboutCraftingComponent} from './components/about-crafting/about-crafting.component';
import {GithubService} from './services/github.service';
import {
  MatButtonModule,
  MatCardModule, MatCheckboxModule,
  MatChipsModule,
  MatExpansionModule,
  MatListModule,
  MatTabsModule,
  MatTooltipModule
} from '@angular/material';
import {RouterModule} from '@angular/router';

@NgModule({
  declarations: [
    AboutComponent,
    TechnologyComponent,
    NewsComponent,
    IssuesComponent,
    ContributorsComponent,
    ChangelogComponent,
    AboutWhatIsComponent,
    AboutPrivacyComponent,
    AboutDataComponent,
    AboutCraftingComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatTooltipModule,
    MatExpansionModule,
    MatChipsModule,
    MatListModule,
    MatCheckboxModule
  ],
  exports: [
    AboutWhatIsComponent,
    AboutPrivacyComponent,
    NewsComponent,
    ChangelogComponent
  ],
  providers: [GithubService]
})
export class AboutModule {
}
