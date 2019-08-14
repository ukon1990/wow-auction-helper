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
                  \`platform\`)
                VALUES (
                  ${entry.userId},
                  ${entry.version},
                  ${entry.type},
                  ${entry.action},
                  ${entry.category},
                  ${entry.label},
                  ${entry.region},
                  ${entry.locale},
                  ${entry.browserLocale},
                  ${entry.isClassic ? 1 : 0},
                  ${entry.platform})`;
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
                          \`timestamp\`)
                    VALUES
                            ("${requestData.type}",
                            "${requestData.bucketName}",
                            "${requestData.region}",
                            ${requestData.ahId},
                            "${requestData.ipObfuscated}",
                            "${requestData.fileName}",
                            ${this.isMe(requestData)},
                            CURRENT_TIMESTAMP);`;
  }

  /* istanbul ignore next */
  private static isMe(requestData) {
    const id = 'seo7xQEYpAmOwTd+NAOY42cgqYTBbLox4aJ1kGO7gXY=';
    return requestData.ipObfuscated === id ? 1 : 0;
  }
}
