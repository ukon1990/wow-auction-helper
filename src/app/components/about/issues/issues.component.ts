import { Component, OnInit } from '@angular/core';
import { GithubService } from '../../../services/github.service';
import { GithubIssue } from '../../../models/github/issues/github-issue.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'wah-issues',
  templateUrl: './issues.component.html',
  styleUrls: ['./issues.component.scss']
})
export class IssuesComponent {
  issues = new Array<GithubIssue>();

  constructor(private service: GithubService, private _sanitizer: DomSanitizer) {
    this.service.getIssues()
      .then(issues =>
        this.issues = issues);
  }

  getIconStyle(url: string): SafeResourceUrl {
    return this._sanitizer.bypassSecurityTrustStyle(
      `url('${
        url
      }')`);
  }

  // TODO: format & get progression from body text
}
