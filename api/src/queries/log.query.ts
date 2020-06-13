import {LogEntry} from '../models/log-entry.model';

export class LogQuery {
  static userEvent(entry: LogEntry): string {
    return `INSERT INTO \`100680-wah\`.\`event_log\` (
                  \`userId\`,
                  \`version\`,
                  \`type\`,
                  \`action\`,
                  \`category\`,
                  \`label\`,
                  \`region\`,
                  \`locale\`,
                  \`browserLocale\`,
                  \`isClassic\`,
                  \`platform\`,
                  \`timestamp\`)
                VALUES (
                  "${entry.userId}",
                  "${entry.version}",
                  "${entry.type}",
                  "${entry.action}",
                  "${entry.category}",
                  "${entry.label}",
                  "${entry.region}",
                  "${entry.locale}",
                  "${entry.browserLocale}",
                  ${entry.isClassic ? 1 : 0},
                  "${entry.platform}",
                  CURRENT_TIMESTAMP);`;
  }

  static s3Event(requestData) {
    return `INSERT INTO \`100680-wah\`.\`s3-logs\`
                          (\`type\`,
                          \`bucket\`,
                          \`region\`,
                          \`ahId\`,
                          \`userId\`,
                          \`fileName\`,
                          \`isMe\`,
                          \`userAgent\`,
                          \`timestamp\`)
                    VALUES
                            ("${requestData.type}",
                            "${requestData.bucketName}",
                            "${requestData.region}",
                            ${requestData.ahId},
                            "${requestData.ipObfuscated}",
                            "${requestData.fileName}",
                            ${this.isMe(requestData)},
                            "${requestData.userAgent}",
                            CURRENT_TIMESTAMP);`;
  }

  /* istanbul ignore next */
  private static isMe(requestData) {
    return requestData.ipObfuscated === 'seo7xQEYpAmOwTd+NAOY42cgqYTBbLox4aJ1kGO7gXY=' ||
    requestData.ipObfuscated === 'VHXNCxunVI2cmo8R8KzoI6eBcLLJnqmQ9Hp48zbVzcU='
      ? 1 : 0;
  }

  static deleteUser(entry: LogEntry) {
    return `DELETE FROM \`100680-wah\`.\`event_log\`
            WHERE userId = ${entry.userId};`;
  }
}
