import { Injectable } from '@angular/core';
import { GithubContributor } from '../models/github/github-contributor.model';
import { HttpClient } from '@angular/common/http';
import { GithubCommit } from '../models/github/commit/github-commit.model';
import { GithubIssue } from '../models/github/issues/github-issue.model';

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
    // Map together with commits on sha https://api.github.com/repos/ukon1990/wow-auction-helper/tags
    return this.http.get('https://api.github.com/repos/ukon1990/wow-auction-helper/commits')
      .toPromise() as Promise<Array<GithubCommit>>;
  }
}
