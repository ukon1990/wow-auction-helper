import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {Response} from '../utils/response.util';
import {DatabaseUtil} from '../utils/database.util';

const crypto = require('crypto');

/* istanbul ignore next */
function isMe(requestData) {
  return requestData.ipObfuscated === 'seo7xQEYpAmOwTd+NAOY42cgqYTBbLox4aJ1kGO7gXY=' ? 1 : 0;
}

/* istanbul ignore next */
exports.handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const detail = event['detail'];
  const params = detail.requestParameters;
  // example: auctions/eu/69/1558442417000.json.gz
  const path = params.key.split('/');
  const requestData = {
    bucketName: params.bucketName,
    type: path[0],
    region: path[1],
    ahId: path[2],
    fileName: path[3],
    ipObfuscated: crypto.createHash('sha256')
      .update(detail.sourceIPAddress)
      .digest('base64')
  };
  const sql = `INSERT INTO \`100680-wah\`.\`s3-logs\`
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
                            ${isMe(requestData)},
                            CURRENT_TIMESTAMP);`;
  console.log('S3 accessed event:', requestData, 'sql: ', sql);
  new DatabaseUtil()
    .query(
      sql)
    .then(() => {
    })
    .catch(console.error);
  Response.send({message: 'success'}, callback);
};
