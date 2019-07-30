import { GithubSubCommit } from './github-sub-commit.model';
import { GithubTag } from './github-tag.model';
import { GithubCommit } from './github-commit.model';

export class ChangeLog {
  title: string;
  tag: string;
  sha: string;
  changes: GithubSubCommit[] = [];

  public static combineTagsAndCommits(tags: GithubTag[], commits: GithubCommit[]): ChangeLog[] {
    const changelog: ChangeLog[] = [],
      changelogMap = new Map<string, GithubTag>();
    let previousTag: ChangeLog;

    tags.forEach((tag: GithubTag) => {
      const entry = new ChangeLog();
      entry.tag = tag.name;
      entry.sha = tag.commit.sha;
      changelogMap[tag.commit.sha] = entry;
      changelog.push(changelogMap[tag.commit.sha]);
    });

    commits.forEach((commit: GithubCommit) => {
      if (changelogMap[commit.sha]) {
        previousTag = changelogMap[commit.sha];
        previousTag.title = `${ new Date(commit.commit.author.date).toLocaleDateString() } - version ${ previousTag.tag }`;
        previousTag.changes.push(commit.commit);
      }
    });

    return changelog;
  }
}
