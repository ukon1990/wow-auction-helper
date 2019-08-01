import {Component} from '@angular/core';
import {GithubService} from '../../services/github.service';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {GithubIssue} from '../../models/github/issues/github-issue.model';
import {GithubIssueBody} from '../../models/github/issues/github-issue-body.model';

@Component({
  selector: 'wah-issues',
  templateUrl: './issues.component.html',
  styleUrls: ['./issues.component.scss']
})
export class IssuesComponent {
  issues = new Array<GithubIssue>();

  /* istanbul ignore next*/
  constructor(private service: GithubService, private _sanitizer: DomSanitizer) {
    this.service.getIssues()
      .then(issues =>
        this.handleGithubIssues(issues));
  }

  handleGithubIssues(issues): void {
    issues.forEach(i =>
      i.bodyFormatted = new GithubIssueBody(i));

    this.issues = this.sortIssuesByCompletion(issues);
  }

  private sortIssuesByCompletion(issues: GithubIssue[]): GithubIssue[] {
    return issues.sort((a, b) => {

      /*
      if (!a.bodyFormatted.todos.length) {
        return -1;
      }*/

      let completionA = a.bodyFormatted.completedCount / a.bodyFormatted.todos.length;
      let completionB = b.bodyFormatted.completedCount / b.bodyFormatted.todos.length;
      if (isNaN(completionA)) {
        completionA = 0;
      }

      if (isNaN(completionB)) {
        completionB = 0;
      }

      if (completionA === completionB) {
        return 0;
      } else if (!completionA || isNaN(completionA)) {
        return 1;
      }
      return completionA > completionB ? -1 : 1;
    });
  }

  /* istanbul ignore next */
  getIconStyle(url: string): SafeResourceUrl {
    return this._sanitizer.bypassSecurityTrustStyle(
      `url('${
        url
      }')`);
  }
}
