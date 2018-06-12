import { GithubIssueLabel } from './github-issue-label.model';
import { GithubUser } from '../github.user.model';

export class GithubIssue {
  html_url: string;
  user: GithubUser;
  title: string;
  body: string;
  labels: Array<GithubIssueLabel>;
  state: string;
  locked: boolean;
  created_at: Date;
  updated_at: Date;
  closed_at: Date;
  author_association: string;
}
