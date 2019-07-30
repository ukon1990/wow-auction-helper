import { GithubIssueLabel } from './github-issue-label.model';
import { GithubUser } from '../github.user.model';
import { GithubIssueBody } from './github-issue-body.model';

export class GithubIssue {
  html_url: string;
  user: GithubUser;
  title: string;
  body: string;
  bodyFormatted?: GithubIssueBody;
  labels: Array<GithubIssueLabel>;
  state: string;
  locked: boolean;
  created_at: Date;
  updated_at: Date;
  closed_at: Date;
  author_association: string;
}
