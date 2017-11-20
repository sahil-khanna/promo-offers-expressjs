import * as path from 'path';
import * as express from 'express';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import * as mongodb from 'mongodb';
import {MongoClient, Db} from 'mongodb';
import {UserController} from './controllers/UserController';


// Creates and configures an ExpressJS web server.
class App {

  // ref to Express instance
  public express: express.Application;
  public db: Db;
  
  //Run configuration methods on the Express instance.
  constructor() {
    this.express = express();
    this.initDB();
    this.middleware();
    this.routes();
  }

  //TODO: Init route and middleware when DB finishes initializing
  private initDB() {
    let mongoClient = new MongoClient().connect('mongodb://sahil.khanna:MyPassword@ds113736.mlab.com:13736/user-profile')
    .then((_db) => {
      console.log(_db);
      this.db = _db;
    })
    .catch((_err) => {
      console.log(_err);
    })
  }

  // Configure Express middleware.
  private middleware(): void {
    this.express.use(logger('dev'));
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
  }

  // Configure API endpoints.
  private routes(): void {
    /* This is just to get up and running, and to make sure what we've got is
     * working so far. This function will change when we start to add more
     * API endpoints */

    let router = express.Router();
    let urlPrefix: String = '/api/1.0/';
    let app = this.express;
    // placeholder route handler

    console.log(this.db);

    app.post(urlPrefix + 'login', new UserController(this.db).login);
    app.post(urlPrefix + 'register', new UserController(this.db).register);
  }

}

export default new App().express;