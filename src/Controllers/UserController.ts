import {Router, Request, Response} from 'express';
import {Validations} from '../helper/Validations';
import {Constants} from '../helper/Constants';
import {Db, UpdateWriteOpResult} from 'mongodb';
import {User} from '../models/User';
import {CryptoHelper} from '../helper/CryptoHelper';
import {Utils} from '../helper/Utils';
import { TokenController } from './TokenController';
import { token } from 'morgan';

export class UserController {

    private db: Db;

    constructor(_db: Db) {
        this.db = _db;

        this.login = this.login.bind(this);
        this.register = this.register.bind(this);
    }

    public login(req: Request, res: Response) {
        let user: User = new User({
            email: req.body.email,
            password: req.body.password
        });

        let errorMessage;
        if (!Validations.isEmailValid(user.email)) {
            errorMessage = 'Email is not valid';
        }
        else if (Utils.nullToObject(user.password, '').length === 0) {
            errorMessage = 'Password is not valid';
        }

        if (errorMessage) {
            res.json({
                code: -1,
                message: errorMessage
            });
            return;
        }

        const generateToken = (_user: User) => {
            const tokenController = new TokenController(this.db);
            tokenController.generateToken(_user)
            .then(_token => {
                res.json({
                    code: 0,
                    message: 'Login successful',
                    data: {
                        token: _token,
                        profile: {
                            id: _user['_id'],
                            firstName: _user.firstName,
                            lastName: _user.lastName,
                            email: _user.email,
                            mobile: _user.mobile,
                            gender: _user.gender
                        }
                    }
                });
            });
        };

        const checkPassword = (_user: User) => {
            CryptoHelper.bycryptCompare(req.body.password, _user.password)
            .then(_resp => {
                if (_resp) {
                    generateToken(_user);
                }
                else {
                    res.json({
                        code: -1,
                        message: 'Invalid username or password',
                        data: null
                    });
                }                
            });
        };

        this.db.collection(Constants.DB_COLLECTIONS.USER).findOne({
            email: user.email
        })
        .then(_dbResult => {
            if (!_dbResult) {
                res.json({
                    code: -1,
                    message: 'Invalid username or password',
                    data: null
                });
                return;
            }
            checkPassword(_dbResult);
        });
    }

    public register(req: Request, res: Response) {
        let errorMessage = null;
        let user = new User({
            email: req.body.email,
            password: req.body.password,
            mobile: req.body.mobile,
            dob: req.body.dob,
            gender: req.body.gender,
            firstName: req.body.firstName,
            lastName: req.body.lastName
        });

        if (!Validations.isEmailValid(user.email)) {
            errorMessage = 'Email is not valid';
        }
        else if (!Validations.isMobileValid(user.mobile)) {
            errorMessage = 'Mobile is not valid';
        }
        else if (!Validations.isNameValid(user.firstName)) {
            errorMessage = 'First name is not valid';
        }
        else if (!Validations.isNameValid(user.lastName)) {
            errorMessage = 'Last name is not valid';
        }
        else if (!Validations.isGenderValid(user.gender)) {
            errorMessage = 'Gender is not valid';
        }
        else if (Utils.nullToObject(user.password, '').length === 0) {
            errorMessage = 'Password is not valid';
        }

        if (errorMessage) {
            res.json({
                code: -1,
                message: errorMessage
            });
            return;
        }

        // Insert into DB is not already inserted
        const inesrtInDB = () => {
            this.db.collection(Constants.DB_COLLECTIONS.USER).updateOne({
                email: user.email
            }, {
                $setOnInsert: user,
            }, {
                upsert: true
            })
            .then(_dbResult => {
                if ('upserted' in _dbResult.result) {
                    res.json({
                        code: 0,
                        message: 'User registered'
                    });
                }
                else {
                    res.json({
                        code: -1,
                        message: 'User already registered'
                    });
                }
            });
        };
        
        //Bycrypt password
        CryptoHelper.bycrypt(req.body.password)
        .then(_hash => {
            user.password = _hash.toString();
            inesrtInDB();
        });
    }
}