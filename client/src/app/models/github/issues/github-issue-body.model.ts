import { GithubIssueTodo } from './github-issue-todo.model';
import { GithubIssue } from './github-issue.model';

export class GithubIssueBody {
  todos: Array<GithubIssueTodo> = new Array<GithubIssueTodo>();
  description = '';
  completedCount = 0;

  constructor(issue: GithubIssue) {
    this.format(issue.body);
  }

  private format(body: string): void {
    if (body === null || !body) {
      this.description = '';
      return;
    }
    const parts = body.split('\n');
    parts.forEach((p, i) => {
      if (p.indexOf('- [x] ') > -1) {
        this.todos.push(
          new GithubIssueTodo(
            p.split('- [x] ')[1],
            true));
        this.completedCount++;

      } else if (p.indexOf('- [ ] ') > -1) {
        this.todos.push(
          new GithubIssueTodo(
            p.split('- [ ] ')[1],
            false));

      } else {
        this.description += p + (i < parts.length ? '<br>' : '');
      }
    });
  }
}
