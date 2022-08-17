import type {AWS} from '@serverless/typescript';
import {admin, auction, character} from '@functions/index';

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
              'arn:aws:dynamodb:eu-central-1:553087069693:table/lang_flash_card',
              'arn:aws:dynamodb:eu-central-1:553087069693:table/lang_last_modified',
              'arn:aws:dynamodb:eu-central-1:553087069693:table/lang_language',
              'arn:aws:dynamodb:eu-central-1:553087069693:table/lang_lesson',
              'arn:aws:dynamodb:eu-central-1:553087069693:table/lang_sentence',
              'arn:aws:dynamodb:eu-central-1:553087069693:table/lang_category',
              'arn:aws:dynamodb:eu-central-1:553087069693:table/lang_word',
              'arn:aws:dynamodb:eu-central-1:553087069693:table/lang_word_class',
              'arn:aws:dynamodb:eu-central-1:553087069693:table/lang_word_gender',
              'arn:aws:cognito-idp:eu-central-1:553087069693:userpool/eu-central-1_5RwvwTYhN',
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
  },
};

module.exports = serverlessConfiguration;