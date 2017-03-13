
const google = require('googleapis');
const GoogleAuth = require('google-auth-library');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

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
}

module.exports = Analytics;
