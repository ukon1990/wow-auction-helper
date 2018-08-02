import { GithubSubCommit } from './github-sub-commit.model';
import { GithubAuthor } from './github-author.model';
import { GithubUser } from '../github.user.model';

export class GithubCommit {
  sha: string;
  commit: GithubSubCommit;
  html_url: string;
  author: GithubUser;
  committer: GithubUser;
}
