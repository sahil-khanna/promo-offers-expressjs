import {Router, Request, Response} from 'express';
import {Validations} from '../helper/Validations';
import {Constants} from '../helper/Constants';
import {Db, UpdateWriteOpResult} from 'mongodb';
import {User} from '../models/User';
import {CryptoHelper} from '../helper/CryptoHelper';
import {Utils} from '../helper/Utils';
import {TokenController} from './TokenController';
import {token} from 'morgan';

export class UserController {

    private db: Db;

    constructor(_db: Db) {
        this.db = _db;

        this.login = this.login.bind(this);
        this.register = this.register.bind(this);
        this.profile = this.profile.bind(this);
        this.activateAccount = this.activateAccount.bind(this);
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
            return res.json({
                code: -1,
                message: errorMessage
            });
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

        // const checkPassword = (_user: User) => {
        //     CryptoHelper.bycryptCompare(req.body.password, _user.password)
        //     .then(_resp => {
        //         if (_resp) {
        //             generateToken(_user);
        //         }
        //         else {
        //             res.json({
        //                 code: -1,
        //                 message: 'Invalid username or password',
        //                 data: null
        //             });
        //         }                
        //     });
        // };

        this.db.collection(Constants.DB_COLLECTIONS.USER).findOne({
            email: user.email,
            password: CryptoHelper.hash(user.password)
        })
        .then(_dbResult => {
            if (!_dbResult) {
                return res.json({
                    code: -1,
                    message: 'Invalid username or password',
                    data: null
                });
            }
            else {
                generateToken(_dbResult);
            }
            // checkPassword(_dbResult);
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
            return res.json({
                code: -1,
                message: errorMessage
            });
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
                        message: 'Account registered. Check your email for instructions to activate your account. The activation URL is also printed on console',
                        data: 'http://localhost:4200/activate-account/' + user.activationKey
                    });
                }
                else {
                    res.json({
                        code: -1,
                        message: 'Email already registered. Try entering a different email'
                    });
                }
            });
        };

        user.activationKey = CryptoHelper.hash(user.email);
        user.isActivated = false;
        user.password = CryptoHelper.hash(user.password);
        inesrtInDB();
    }

    public activateAccount(req: Request, res: Response) {
        const params = req.params;

        this.db.collection(Constants.DB_COLLECTIONS.USER).findOneAndUpdate(
            { activationKey: params[0].split('/')[1], isActivated: false },
            { $set: {activationKey: null, isActivated: true} }
        )
        .then((_dbResult) => {
            if (!_dbResult || !_dbResult.value) {
                return res.json({
                    code: -1,
                    message: 'Invalid activation key'
                });
            }

            return res.json({
                code: 0,
                message: 'Account activated successfully',
                data: null
            });
        })
        .catch(() => {
            return res.json({
                code: -1,
                message: 'Unable to process request'
            });
        });
    }

    public profile(req: Request, res: Response) {
        let token = req.headers['up-token'];
        let newToken;
        if (!token) {
            return res.json({
                code: -1,
                message: 'Invalid token'
            });
        }

        let errorMessage = null;
        let user = req.body;

        if (!token) {
            errorMessage = 'Invalid token';
        }
        else if (!Validations.isEmailValid(user.email)) {
            errorMessage = 'Email is not valid';
        }
        else if ('mobile' in user && !Validations.isMobileValid(user.mobile)) {
            errorMessage = 'Mobile is not valid';
        }
        else if ('firstName' in user && !Validations.isNameValid(user.firstName)) {
            errorMessage = 'First name is not valid';
        }
        else if ('lastName' in user && !Validations.isNameValid(user.lastName)) {
            errorMessage = 'Last name is not valid';
        }
        else if ('gender' in user && !Validations.isGenderValid(user.gender)) {
            errorMessage = 'Gender is not valid';
        }
        else if ('password' in user && Utils.nullToObject(user.password, '').length === 0) {
            errorMessage = 'Password is not valid';
        }

        if (errorMessage) {
            return res.json({
                code: -1,
                message: errorMessage
            });
        }

        const updateProfile = () => {
            this.db.collection(Constants.DB_COLLECTIONS.USER).updateOne(
                {email: user.email},
                {$set: user}
            )
            .then(_dbResult => {
                if (_dbResult) {

                    return res.json({
                        code: 0,
                        message: 'Profile updated successfully',
                        data: null
                    });
                }
            });
        };

        const validateToken = () => {
            let tokenController = new TokenController(this.db);
            tokenController.isTokenValid(token.toString())
            .then(_token => {
                if (!_token) {
                    return res.json({
                        code: -1,
                        message: 'Invalid token'
                    });
                }
                else {
                    res.setHeader('up-token', _token.toString());   // Send this new token in response header
                    updateProfile();
                }
            });
        };

        if ('password' in user) {
            CryptoHelper.bycrypt(user.password)
            .then(_hash => {
                user.password = _hash.toString();
                validateToken();
            });
        }
        else {
            validateToken();
        }
    }
}