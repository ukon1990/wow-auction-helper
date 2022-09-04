import type {AWS} from '@serverless/typescript';
import {
  admin,
  auction,
  character,
  dashboard,
  logs,
  npc,
  profession,
  realm,
  recipe,
  updates,
  user
} from '@functions/index';
import item from '@functions/item';

const serverlessConfiguration: AWS = {
  service: 'wah-api',
  frameworkVersion: '3',
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
  plugins: ['serverless-esbuild', 'serverless-offline'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
    lambdaHashingVersion: '20201221',
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: [
              'dynamodb:DescribeTable',
              'dynamodb:Query',
              'dynamodb:Scan',
              'dynamodb:GetItem',
              'dynamodb:PutItem',
              'dynamodb:UpdateItem',
              'dynamodb:DeleteItem',

              'cognito-idp:ListUsers',
              'cognito-idp:AdminGetUser',
            ],
            Resource: [
              // DynamoDB
              'arn:aws:dynamodb:eu-west-1:553087069693:table/wah_items',
              'arn:aws:dynamodb:eu-west-1:553087069693:table/wah_messages',
              'arn:aws:dynamodb:eu-west-1:553087069693:table/wah_npcs',
              'arn:aws:dynamodb:eu-west-1:553087069693:table/wah_professions',
              'arn:aws:dynamodb:eu-west-1:553087069693:table/wah_recipes',

              // DynamoDB with replicas
              'arn:aws:dynamodb:eu-west-1:553087069693:table/wah_auction_houses',
              'arn:aws:dynamodb:us-west-1:553087069693:table/wah_auction_houses',
              'arn:aws:dynamodb:ap-northeast-2:553087069693:table/wah_auction_houses',

              'arn:aws:dynamodb:eu-west-1:553087069693:table/wah_auction_houses_update_log',
              'arn:aws:dynamodb:us-west-1:553087069693:table/wah_auction_houses_update_log',
              'arn:aws:dynamodb:ap-northeast-2:553087069693:table/wah_auction_houses_update_log',

              'arn:aws:dynamodb:eu-west-1:553087069693:table/wah_dashboards',
              'arn:aws:dynamodb:us-west-1:553087069693:table/wah_dashboards',
              'arn:aws:dynamodb:ap-northeast-2:553087069693:table/wah_dashboards',

              'arn:aws:dynamodb:eu-west-1:553087069693:table/wah_user_settings',
              'arn:aws:dynamodb:us-west-1:553087069693:table/wah_user_settings',
              'arn:aws:dynamodb:ap-northeast-2:553087069693:table/wah_user_settings',

              // Cognito
              'arn:aws:cognito-idp:eu-west-1:553087069693:userpool/eu-west-1_1wW49ehTc',
            ]
          }
        ]
      }
    }
  },
  // import the function via paths
  functions: {
    ...admin,
    ...auction,
    ...character,
    ...dashboard,
    ...item,
    ...logs,
    ...npc,
    ...profession,
    ...realm,
    ...recipe,
    ...updates,
    ...user,
  },
};

module.exports = serverlessConfiguration;