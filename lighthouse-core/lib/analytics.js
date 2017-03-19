/**
 * @license
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

const google = require('googleapis');
const GoogleAuth = require('google-auth-library');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const COLUMNS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

class Analytics {
  constructor(spreadsheetId) {
    this._authClient = null;
    this._spreadsheetId = spreadsheetId;
  }

  /**
   * @return {!Promise}
   */
  authClient() {
    if (this._authClient) {
      return Promise.resolve(this._authClient);
    }

    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      return Promise.reject('Environment variable GOOGLE_APPLICATION_CREDENTIALS is not set');
    }

    const authFactory = new GoogleAuth();
    return new Promise((resolve, reject) => {
      authFactory.getApplicationDefault((err, authClient) => {
        if (err) {
          return reject(err);
        }

        if (authClient.createScopedRequired && authClient.createScopedRequired()) {
          authClient = authClient.createScoped(SCOPES);
        }

        this._authClient = authClient;
        resolve(this._authClient);
      });
    });
  }

  append(valuesToAppend, tableName) {
    const sheets = google.sheets('v4');
    // clone values to append
    const values = [...valuesToAppend];

    return this.authClient()
      .then((auth) => {
        return new Promise((resolve, reject) => {
          sheets.spreadsheets.values.append({
            auth,
            spreadsheetId: this._spreadsheetId,
            valueInputOption: 'USER_ENTERED',
            range: `${tableName}`,
            resource: {
              values: values,
            },
          }, (err, response) => {
            if (err) {
              return reject(new Error(err));
            }

            resolve(response);
          });
        });
      });
  }

  update(valuesToUpdate, tableName, range) {
    const sheets = google.sheets('v4');
    // clone values to append
    const values = [...valuesToUpdate];

    return this.authClient()
      .then((auth) => {
        return new Promise((resolve, reject) => {
          sheets.spreadsheets.values.update({
            auth,
            spreadsheetId: this._spreadsheetId,
            valueInputOption: 'USER_ENTERED',
            range: `${tableName}!${range}`,
            resource: {
              values: values,
            },
          }, (err, response) => {
            if (err) {
              return reject(new Error(err));
            }

            resolve(response);
          });
        });
      });
  }

  fetch(range, tableName) {
    const sheets = google.sheets('v4');

    return this.authClient()
      .then((auth) => {
        return new Promise((resolve, reject) => {
          sheets.spreadsheets.values.get({
            auth,
            spreadsheetId: this._spreadsheetId,
            majorDimension: 'ROWS',
            range: `${tableName}!${range}`,
          }, (err, response) => {
            if (err) {
              return reject(new Error(err));
            }

            resolve(response);
          });
        });
      });
  }

  static calculateRange(data) {
    let longestColumn = 0;
    for (let i = 0; i < data.length; i++) {
      longestColumn = Math.max(longestColumn, data[i].length);
    }

    const tries = Math.ceil(longestColumn / COLUMNS.length);
    const restColumnIndex = longestColumn % COLUMNS.length;
    const column = `${tries > 1 ? COLUMNS[tries - 2] : ''}${COLUMNS[restColumnIndex - 1]}`;

    return `A1:${column}${data.length}`;
  }
}

module.exports = Analytics;
