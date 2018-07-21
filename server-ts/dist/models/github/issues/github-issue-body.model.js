"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const github_issue_todo_model_1 = require("./github-issue-todo.model");
class GithubIssueBody {
    constructor(issue) {
        this.todos = new Array();
        this.description = '';
        this.completedCount = 0;
        this.format(issue.body);
    }
    format(body) {
        const parts = body.split('\n');
        parts.forEach((p, i) => {
            if (p.indexOf('- [x] ') > -1) {
                this.todos.push(new github_issue_todo_model_1.GithubIssueTodo(p.split('- [x] ')[1], true));
                this.completedCount++;
            }
            else if (p.indexOf('- [ ] ') > -1) {
                this.todos.push(new github_issue_todo_model_1.GithubIssueTodo(p.split('- [ ] ')[1], false));
            }
            else {
                this.description += p + (i < parts.length ? '<br>' : '');
            }
        });
    }
}
exports.GithubIssueBody = GithubIssueBody;
//# sourceMappingURL=github-issue-body.model.js.map