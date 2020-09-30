import {LogEntry} from '../models/log-entry.model';
import {RDSQueryUtil} from '../utils/query.util';

export class LogRepository {
  static globalStatus = `
    SHOW GLOBAL STATUS
    WHERE Variable_name IN (
    'Max_used_connections',
    'Threads_connected',
    'Uptime'
    );`;

  static activeQueryCount = `
      SELECT count(*) as activeQueries
      FROM information_schema.processlist
      WHERE info LIKE 'INSERT INTO itemPriceHistoryPerHour%'
         OR info LIKE '%DELETE FROM%'`;

  static processList = `
      SELECT id,
             query_id                         as queryId,
             tid,
             command,
             state,
             time,
             time_ms                          as timeMs,
             info,
             stage,
             max_stage                        as maxStage,
             progress,
             ROUND(memory_used / 1024 / 1024) as memoryUsed,
             examined_rows                    as examinedRows
      FROM information_schema.processlist
      WHERE info IS NOT NULL
        AND info NOT LIKE '%SHOW GLOBAL STATUS%'
        AND info NOT LIKE '%information_schema.processlist%';`;

  static tableSize = `
      SELECT TABLE_NAME                                        AS 'name',
             TABLE_ROWS                                        as 'rows',
             ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024) AS sizeInMb
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = '100680-wah'
      ORDER BY (DATA_LENGTH + INDEX_LENGTH)
          DESC;`;

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

  static s3Event(data: any[]) {/*
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
                            CURRENT_TIMESTAMP);`;*/
    return new RDSQueryUtil(`\`100680-wah\`.\`s3-logs\``)
      .multiInsert(data)
      .replace(';', '');
  }

  static deleteUser(entry: LogEntry) {
    return `DELETE FROM \`100680-wah\`.\`event_log\`
            WHERE userId = ${entry.userId};`;
  }
}
