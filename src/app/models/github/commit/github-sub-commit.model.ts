import { GithubAuthor } from './github-author.model';

export class GithubSubCommit {
  author: GithubAuthor;
  committer: GithubAuthor;
  message: string;
}
