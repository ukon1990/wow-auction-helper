import {Component, Input, OnInit} from '@angular/core';
import { GithubService } from '../../services/github.service';
import {ChangeLog} from '../../models/github/commit/changelog.model';

@Component({
  selector: 'wah-changelog',
  templateUrl: './changelog.component.html',
  styleUrls: ['./changelog.component.scss']
})
export class ChangelogComponent implements OnInit {
  @Input() changeLogs: ChangeLog[] = [];
  isLoading: boolean;

  constructor(private service: GithubService) { }

  ngOnInit() {
    if (!this.changeLogs || !this.changeLogs.length) {
      this.isLoading = true;
      this.service.getChangeLogs()
        .then(changeLogs => {
          this.changeLogs = changeLogs;
          this.isLoading = false;
          console.log(this.changeLogs);
        })
        .catch(error => {
          console.error('getChangelog', error);
          this.isLoading = false;
        });
    }
  }

}
