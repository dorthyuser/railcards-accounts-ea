"use strict";
const jsforce = require("jsforce");
const config = require("../config");

let conn = null;
let lastLoginTime = 0;
const TTL = 1000 * 60 * 55; // refresh every 55 minutes

async function loginIfRequired() {
  const now = Date.now();
  if (conn && (now - lastLoginTime) < TTL) return conn;

  conn = new jsforce.Connection({ loginUrl: config.salesforce.loginUrl });
  const username = config.salesforce.username;
  const password = `${config.salesforce.password}${config.salesforce.securityToken}`;
  if (!username || !config.salesforce.password) {
    throw new Error('Salesforce credentials are not configured');
  }

  await conn.login(username, password);
  lastLoginTime = Date.now();
  return conn;
}

module.exports = {
  getAccountById: async (id) => {
    const connection = await loginIfRequired();
    try {
      const result = await connection.sobject("Account").retrieve(id);
      return result;
    } catch (err) {
      if (err.errorCode === 'NOT_FOUND') return null;
      throw err;
    }
  },

  createAccount: async (payload) => {
    const connection = await loginIfRequired();
    // Map payload fields to Salesforce Account fields as required by business logic
    const sfPayload = {
      Name: payload.name || payload.accountName || 'Unnamed Account',
      External_Id__c: payload.External_Id__c || payload.externalId || undefined,
      // Add other mappings here
    };

    const res = await connection.sobject("Account").create(sfPayload);
    return res;
  }
};
