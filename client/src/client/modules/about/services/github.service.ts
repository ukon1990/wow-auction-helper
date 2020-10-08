import {Injectable} from '@angular/core';
import {GithubContributor} from '../models/github/github-contributor.model';
import {HttpClient} from '@angular/common/http';
import {GithubCommit} from '../models/github/commit/github-commit.model';
import {GithubIssue} from '../models/github/issues/github-issue.model';
import {ChangeLog} from '../models/github/commit/changelog.model';
import {GithubTag} from '../models/github/commit/github-tag.model';
import {GithubIssueBody} from '../models/github/issues/github-issue-body.model';
import {BehaviorSubject} from 'rxjs';
import {Item} from '../../../models/item/item';
import {TextUtil} from '@ukon1990/js-utilities';

@Injectable({
  providedIn: 'root'
})
export class GithubService {
  private readonly BASE_URL = 'https://api.github.com/repos/ukon1990/wow-auction-helper/';
  changelog: BehaviorSubject<ChangeLog[]> = new BehaviorSubject<ChangeLog[]>([]);
  latestVersion: string;

  // codeContributors
  constructor(private http: HttpClient) {
  }

  getContributors(): Promise<Array<GithubContributor>> {
    return this.http.get(`${this.BASE_URL}contributors`)
      .toPromise() as Promise<Array<GithubContributor>>;
  }

  getIssues(): Promise<GithubIssue[]> {
    return this.http.get(`${this.BASE_URL}issues`)
      .toPromise()
      .then((issues: GithubIssue[]) => {
        issues.forEach(i =>
          i.bodyFormatted = new GithubIssueBody(i));
        return issues;
      }) as Promise<GithubIssue[]>;
  }

  getLatestCommits(): Promise<Array<GithubCommit>> {
    return this.http.get(`${this.BASE_URL}commits?per_page=500`)
      .toPromise() as Promise<Array<GithubCommit>>;
  }

  getTags(): Promise<Array<GithubTag>> {
    return this.http.get(`${this.BASE_URL}tags?per_page=500`)
      .toPromise() as Promise<Array<GithubTag>>;
  }

  async getChangeLogs(): Promise<ChangeLog[]> {
    return new Promise<ChangeLog[]>(async (resolve, reject) => {
      let commits, tags;
      await this.getLatestCommits()
        .then(c => commits = c)
        .catch(error => reject());


      await this.getTags()
        .then(t => tags = t)
        .catch(error => reject());

      const changelog: ChangeLog[] = ChangeLog.combineTagsAndCommits(tags, commits)
        .sort((a, b) => +b.date - +a.date);
      for (let i = 0; i < changelog.length; i++) {
        const entry = changelog[i];
        if (entry.changes.length > 0 && !TextUtil.contains(entry.tag, 'backend')) {
          this.latestVersion = entry.tag;
        }
      }
      this.changelog.next(changelog);
      resolve(changelog);
    });
  }
}
