'use strict';

const AWS = require('aws-sdk');
const config = require('../config');
const logger = require('../logger');

let s3 = null;

function ensureClient() {
  if (s3) return s3;
  if (!config.features.useS3) {
    logger.warn('S3 integration disabled via feature flag. Using mock.');
    s3 = { mock: true };
    return s3;
  }
  AWS.config.update({ region: config.aws.region });
  s3 = new AWS.S3();
  return s3;
}

async function putObject(key, body, contentType) {
  const client = ensureClient();
  if (client.mock) {
    logger.info('S3 putObject mock: %s (len=%d)', key, body && body.length ? body.length : 0);
    return { key };
  }
  const params = {
    Bucket: config.aws.bucket,
    Key: key,
    Body: body,
    ContentType: contentType || 'application/octet-stream'
  };
  return client.putObject(params).promise();
}

async function getObject(key) {
  const client = ensureClient();
  if (client.mock) {
    logger.info('S3 getObject mock: %s', key);
    return null;
  }
  const params = { Bucket: config.aws.bucket, Key: key };
  const res = await client.getObject(params).promise();
  return res;
}

module.exports = { putObject, getObject };
