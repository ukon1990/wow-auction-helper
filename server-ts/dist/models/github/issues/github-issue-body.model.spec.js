"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const github_issue_body_model_1 = require("./github-issue-body.model");
fdescribe('IssuesComponent', () => {
    describe('format', () => {
        it('Should be able to format message', () => {
            const body = new github_issue_body_model_1.GithubIssueBody({
                body: 'A user should be able to filter AuctionItem\'s by potential reset profit.'
                    + ' Also allowing the user to limit it to a certain cost, max buy quantity etc.\n'
                    + '- [ ] Support for filtering with a maximum value I am willing to spend\n'
                    + '- [x] Define a minimum potential profit value\n'
                    + '- [x] Defining a minimum sale rate\n'
                    + '- [x] Define a target price that is a user defined % of the market value for that item\n'
                    + '- [ ] Support for filtering for a set max quantity to buy per item'
            });
            expect(body.todos.length).toBe(5);
            expect(body.todos[0].text).toEqual('Support for filtering with a maximum value I am willing to spend');
            expect(body.todos[0].completed).toBeFalsy();
            expect(body.todos[1].completed).toBeTruthy();
            console.log(body);
        });
    });
});
//# sourceMappingURL=github-issue-body.model.spec.js.map