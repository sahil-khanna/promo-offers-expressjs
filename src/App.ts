import { Router, Request, Response } from 'express';
import * as path from 'path';
import * as express from 'express';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import * as mongodb from 'mongodb';
import { MongoClient, Db } from 'mongodb';
import { UserController } from './controllers/UserController';
import { ContributionController } from './controllers/ContributionController';
import { Constants } from './helper/Constants';


// Creates and configures an ExpressJS web server.
class App {

  // ref to Express instance
  public express: express.Application;
  public db: Db;
  
  //Run configuration methods on the Express instance.
  constructor() {
    this.express = express();
    this.initDB();
  }

  //TODO: Init route and middleware when DB finishes initializing
  private initDB() {
    // let mongoClient = new MongoClient().connect('mongodb://sahil.khanna:MyPassword@ds239217.mlab.com:39217/user-profile')
    let mongoClient = new MongoClient().connect('mongodb://sahil.khanna:MyPassword@ds135757.mlab.com:35757/user-profile-us')
    .then((_db) => {
      this.db = _db;
      this.middleware();
      this.routes();
    })
    .catch((_err) => {
      console.log('***DB Error***' + _err);
    })
  }

  // Configure Express middleware.
  private middleware(): void {
    this.express.use(logger('dev'));
    this.express.use(bodyParser.json({limit: '50mb'}));
    this.express.use(bodyParser.urlencoded({ extended: false }));
  }

  // Configure API endpoints.
  private routes(): void {
    let router = express.Router();
    let urlPrefix: String = '/api/1.0/';
    let app = this.express;
    // placeholder route handler

    app.post(urlPrefix + 'login', new UserController(this.db).login);
    app.post(urlPrefix + 'register', new UserController(this.db).register);
    app.put(urlPrefix + 'profile', new UserController(this.db).profile);
    app.get(urlPrefix + 'activate-account/*', new UserController(this.db).activateAccount);
    app.get(urlPrefix + 'forgot-password/*', new UserController(this.db).forgotPassword);
    app.put(urlPrefix + 'reset-password', new UserController(this.db).resetPassword);
    app.get(urlPrefix + 'logout', new UserController(this.db).logout);
    app.post(urlPrefix + 'contribute', new ContributionController(this.db).add);
    app.get(urlPrefix + 'contributions', new ContributionController(this.db).get);

    app.get('/resources/uploads/*', function(req: Request, res: Response) {
      const split = __dirname.split('/');
      delete split[split.length - 1];
      res.sendFile(split.join('/') + Constants.FILE_UPLOAD_PATH + req.params['0']);
    });
  }
}

export default new App().express;