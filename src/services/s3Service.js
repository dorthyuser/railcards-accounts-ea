"use strict";
const AWS = require("aws-sdk");
const config = require("../config");

AWS.config.update({
  region: config.aws.region,
  accessKeyId: config.aws.accessKeyId || undefined,
  secretAccessKey: config.aws.secretAccessKey || undefined
});

const s3 = new AWS.S3();

module.exports = {
  uploadJSON: async (key, obj, options = {}) => {
    if (!config.aws.s3Bucket) {
      throw new Error('S3_BUCKET is not configured');
    }

    const params = {
      Bucket: config.aws.s3Bucket,
      Key: key,
      Body: Buffer.from(JSON.stringify(obj)),
      ContentType: 'application/json',
      ACL: options.acl || 'private'
    };

    return new Promise((resolve, reject) => {
      s3.putObject(params, (err, data) => {
        if (err) return reject(err);
        resolve({ key, data });
      });
    });
  }
};
