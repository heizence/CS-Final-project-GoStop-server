import * as express from 'express';
import Controller from '../interfaces/controller.interface';
import { google } from 'googleapis';
import authCtrl from './authentication.controller';
const OAuth2Data = require('../google_key.json');

class GoogleOAuthController implements Controller {
  public path = '/auth';
  public router = express.Router();
  private CLIENT_ID = OAuth2Data.client.id;
  private CLIENT_SECRET = OAuth2Data.client.secret;
  private REDIRECT_URL = OAuth2Data.client.redirect;
  private authed = false;

  private oAuth2Client = new google.auth.OAuth2(
    this.CLIENT_ID,
    this.CLIENT_SECRET,
    this.REDIRECT_URL,
  );

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/google`, this.getGoogleUrl);
    this.router.get(
      `${this.path}/google/callback`,
      this.getGoogleAuth,
      authCtrl.logIn,
    );
  }

  private getGoogleUrl = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    if (!this.authed) {
      const url = this.oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: 'https://www.googleapis.com/auth/gmail.readonly',
      });
      console.log(url);
      res.redirect(url);
    } else {
      const gmail = google.gmail({ version: 'v1', auth: this.oAuth2Client });
      gmail.users.labels.list(
        {
          userId: 'me',
        },
        (err, res) => {
          if (err) return console.log('The API returned an error: ' + err);
          const labels = res.data.labels;
          if (labels.length) {
            console.log('Labels:');
            labels.forEach(label => {
              console.log(`- ${label.name}`);
            });
          } else {
            console.log('No labels found');
          }
        },
      );

      res.send('Logged in');
    }
  };

  private getGoogleAuth = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const code = req.query.code;
    if (code) {
      this.oAuth2Client.getToken(code, (err, tokens) => {
        if (err) {
          console.log('Error authenticating');
          console.log(err);
        } else {
          console.log('Successfully authenticated');
          this.oAuth2Client.setCredentials(tokens);
          this.authed = true;
          res.redirect('/auth/google');
        }
      });
    }
  };
}

export default GoogleOAuthController;
