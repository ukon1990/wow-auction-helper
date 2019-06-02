import { Injectable } from '@angular/core';
import { GithubContributor } from '../models/github/github-contributor.model';
import { HttpClient } from '@angular/common/http';
import { GithubCommit } from '../models/github/commit/github-commit.model';
import { GithubIssue } from '../models/github/issues/github-issue.model';
import { ChangeLog } from '../models/github/commit/changelog.model';
import { GithubTag } from '../models/github/commit/github-tag.model';

@Injectable({
  providedIn: 'root'
})
export class GithubService {
  // https://api.github.com/repos/ukon1990/wow-auction-helper/contributors
  constructor(private http: HttpClient) { }

  getContributors(): Promise<Array<GithubContributor>> {
    return this.http.get('https://api.github.com/repos/ukon1990/wow-auction-helper/contributors')
      .toPromise() as Promise<Array<GithubContributor>>;
  }

  getIssues(): Promise<Array<GithubIssue>> {
    return this.http.get('https://api.github.com/repos/ukon1990/wow-auction-helper/issues')
      .toPromise() as Promise<Array<GithubIssue>>;
  }

  getLatestCommits(): Promise<Array<GithubCommit>> {
    return this.http.get('https://api.github.com/repos/ukon1990/wow-auction-helper/commits')
      .toPromise() as Promise<Array<GithubCommit>>;
  }

  getTags(): Promise<Array<GithubTag>> {
    return this.http.get('https://api.github.com/repos/ukon1990/wow-auction-helper/tags')
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

      resolve(
        ChangeLog.combineTagsAndCommits(tags, commits));
    });
  }
}
