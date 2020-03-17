import {GithubAuthor} from './github-author.model';

export class GithubSubCommit {
  author: GithubAuthor;
  committer: GithubAuthor;
  title: string;
  message: string;

  constructor(private commit: GithubSubCommit) {
    this.setTitle(commit.message);
    this.committer = commit.committer;
    this.author = commit.author;
  }

  setTitle(message: string) {
    let isList = false;
    console.log(message);
    const split = message.split(/[\n]{1,1}/gi);
    this.title = split[0];
    this.message = '';
    split.slice(1, split.length)
      .forEach((line, index) => {
        if (!line && index === 0) {
          return;
        }
        if (line.indexOf('- ') === 0) {
          if (!isList) {
            isList = true;
            this.message += `<ul>`;
          }
          this.message += `<li>${line.replace('- ', '')}</li>`;
          return;
        } else if (isList) {
          this.message += `</ul>`;
          isList = false;
        } else if (line.indexOf(':') === line.length -1) {
          this.message += `<strong>${line}</strong>\n`;
          return;
        }
        this.message += `${line}\n`;
      });
  }
}
