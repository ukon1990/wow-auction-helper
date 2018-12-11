import { Component, OnInit } from '@angular/core';
import { GithubService } from '../../../services/github.service';
import { GithubIssue } from '../../../models/github/issues/github-issue.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { GithubIssueBody } from '../../../models/github/issues/github-issue-body.model';

@Component({
  selector: 'wah-issues',
  templateUrl: './issues.component.html',
  styleUrls: ['./issues.component.scss']
})
export class IssuesComponent {
  issues = new Array<GithubIssue>();

  constructor(private service: GithubService, private _sanitizer: DomSanitizer) {
    this.service.getIssues()
      .then(issues => {
        issues.forEach(i =>
          i.bodyFormatted = new GithubIssueBody(i));
        issues.sort((a, b) => {
          return b.bodyFormatted.completedCount / b.bodyFormatted.todos.length
            - a.bodyFormatted.completedCount / a.bodyFormatted.todos.length;
        });
        this.issues = issues;
      });
  }

  getIconStyle(url: string): SafeResourceUrl {
    return this._sanitizer.bypassSecurityTrustStyle(
      `url('${
        url
      }')`);
  }
}
