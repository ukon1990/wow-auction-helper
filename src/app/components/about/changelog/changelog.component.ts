import { Component, OnInit } from '@angular/core';
import { GithubService } from '../../../services/github.service';
import { ChangeLog } from '../../../models/github/commit/changelog.model';

@Component({
  selector: 'wah-changelog',
  templateUrl: './changelog.component.html',
  styleUrls: ['./changelog.component.scss']
})
export class ChangelogComponent implements OnInit {
  changeLogs: ChangeLog[] = [];

  constructor(private service: GithubService) { }

  ngOnInit() {
    this.service.getChangeLogs()
      .then(changeLogs => {
        console.log(changeLogs);
        this.changeLogs = changeLogs;
      })
      .catch(error => console.error('getChangelog', error));
  }

}
