'use strict';

const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
  env: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  salesforce: {
    username: process.env.SF_LOGIN_USERNAME || null,
    password: process.env.SF_LOGIN_PASSWORD || null,
    token: process.env.SF_LOGIN_TOKEN || null,
    loginUrl: process.env.SF_LOGIN_LOGINURL || 'https://login.salesforce.com'
  },
  aws: {
    region: process.env.AWS_REGION || 'eu-west-1',
    bucket: process.env.S3_BUCKET || null
  },
  features: {
    useSalesforce: (process.env.USE_SALESFORCE || 'true') === 'true',
    useS3: (process.env.USE_S3 || 'true') === 'true'
  }
};
