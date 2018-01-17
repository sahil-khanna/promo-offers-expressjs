import { Router, Request, Response } from 'express';
import { Validations } from '../helper/Validations';
import { Constants } from '../helper/Constants';
import { Db, UpdateWriteOpResult } from 'mongodb';
import { User } from '../models/User';
import { CryptoHelper } from '../helper/CryptoHelper';
import { Utils } from '../helper/Utils';
import { TokenController, TokenValidationResponse } from './TokenController';

export class UserController {

    private db: Db;

    constructor(_db: Db) {
        this.db = _db;

        this.login = this.login.bind(this);
        this.register = this.register.bind(this);
        this.profile = this.profile.bind(this);
        this.activateAccount = this.activateAccount.bind(this);
        this.forgotPassword = this.forgotPassword.bind(this);
        this.resetPassword = this.resetPassword.bind(this);
        this.logout = this.logout.bind(this);
    }

    public login(req: Request, res: Response) {
        let user: User = new User({
            email: req.body.email,
            password: req.body.password
        });

        let errorMessage;
        if (!Validations.isEmailValid(user.email)) {
            errorMessage = Constants.RESPONSE_INVALID_EMAIL;
        }
        else if (Utils.nullToObject(user.password, '').length === 0) {
            errorMessage = Constants.RESPONSE_INVALID_PASSWORD;
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

        this.db.collection(Constants.DB_COLLECTIONS.USER).findOne({
            email: user.email,
            password: CryptoHelper.hash(user.password),
        })
        .then(_dbResult => {
            if (!_dbResult) {
                return res.json({
                    code: -1,
                    message: Constants.RESPONSE_INVALID_USERNAME_OR_PASSWORD
                });
            }
            else if (!_dbResult.isActivated) {
                return res.json({
                    code: -1,
                    message: Constants.RESPONSE_ACCOUNT_NOT_ACTIVATED
                });
            }
            else {
                generateToken(_dbResult);
            }
        });
    }

    public logout(req: Request, res: Response) {
        const token = req.headers[Constants.TOKEN_HEADER_KEY];

        if (!token) {
            return res.json({
                code: -1,
                message: Constants.RESPONSE_INVALID_TOKEN
            });
        }
        
        this.db.collection(Constants.DB_COLLECTIONS.TOKEN).updateOne(
            { token: token, status: true },
            { $set: {status: false} }
        )
        .then(_dbResult => {
            if (!_dbResult) {
                return res.json({
                    code: -1,
                    message: Constants.RESPONSE_INVALID_TOKEN
                });
            }
            else {
                return res.json({
                    code: 0,
                    message: Constants.RESPONSE_LOGGED_OUT
                });
            }
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

        user.activationKey = CryptoHelper.hash(user.email + Date.now());    // To make the activation key unique
        user.isActivated = false;
        user.password = CryptoHelper.hash(user.password);

        // Insert into DB if not already inserted
        this.db.collection(Constants.DB_COLLECTIONS.USER).updateOne(
            { email: user.email },
            { $setOnInsert: user},
            { upsert: true }
        )
        .then(_dbResult => {
            if ('upserted' in _dbResult.result) {
                res.json({
                    code: 0,
                    message: 'Account registered. Check your email for instructions to activate your account. The activation URL is also printed on console',
                    data: 'http://localhost:4200/activate-account/' + user.activationKey
                });
            } else {
                res.json({
                    code: -1,
                    message: 'Email already registered. Try entering a different email'
                });
            }
        });
    }

    public forgotPassword(req: Request, res: Response) {
        const params:any = Utils.deparam(req.params[0]);

        if (!Validations.isEmailValid(params.email)) {
            return res.json({
                code: -1,
                message: Constants.RESPONSE_INVALID_EMAIL
            });
        }

        const passwordKey = CryptoHelper.hash(params.email + Date.now());    // To make the password key unique

        this.db.collection(Constants.DB_COLLECTIONS.USER).findOneAndUpdate(
            { email: params.email, isActivated: true },
            { $set: {passwordKey: passwordKey} }
        )
        .then((_dbResult: any) => {
            if (!_dbResult || !_dbResult.value) {
                return res.json({
                    code: -1,
                    message: Constants.RESPONSE_INVALID_EMAIL_OR_ACCOUNT_NOT_ACTIVATED
                });
            }
            
            return res.json({
                code: 0,
                message: Constants.RESPONSE_FORGOT_PASSWORD_EMAIL,
                data: 'http://localhost:4200/reset-password?passwordKey=' + passwordKey + '&email=' + params.email
            });
        })
        .catch((err) => {
            return res.json({
                code: -1,
                message: Constants.RESPONSE_UNABLE_TO_PROCESS
            });
        });
    }

    public resetPassword(req: Request, res: Response) {
        const body = req.body;

        const criteria: any = { isActivated: true };
        if (!body.password) {
            return res.json({
                code: -1,
                message: Constants.RESPONSE_INVALID_PARAMETERS
            });
        }
        else if (body.passwordKey) {
            criteria.passwordKey = body.passwordKey
        }
        else if (body.email) {
            criteria.email = body.email
        }
        else {
            return res.json({
                code: -1,
                message: Constants.RESPONSE_INVALID_PARAMETERS
            });
        }

        this.db.collection(Constants.DB_COLLECTIONS.USER).findOneAndUpdate(
            criteria,
            { $set: {password: CryptoHelper.hash(body.password), passwordKey: null} }
        )
        .then((_dbResult: any) => {
            if (!_dbResult || !_dbResult.value) {
                return res.json({
                    code: -1,
                    message: Constants.RESPONSE_INVALID_PARAMETERS
                });
            }
            
            return res.json({
                code: 0,
                message: Constants.RESPONSE_PASSWORD_RESET
            });
        })
        .catch((err) => {
            return res.json({
                code: -1,
                message: Constants.RESPONSE_UNABLE_TO_PROCESS
            });
        });
    }

    public activateAccount(req: Request, res: Response) {
        const params:any = Utils.deparam(req.params[0]);

        if (!params.key) {
            return res.json({
                code: -1,
                message: Constants.RESPONSE_INVALID_ACTIVATION_KEY
            });
        }

        this.db.collection(Constants.DB_COLLECTIONS.USER).findOneAndUpdate(
            { activationKey: params.key, isActivated: false },
            { $set: {isActivated: true} }
        )
        .then((_dbResult) => {
            if (!_dbResult || !_dbResult.value) {
                return res.json({
                    code: -1,
                    message: Constants.RESPONSE_INVALID_ACTIVATION_KEY
                });
            }

            return res.json({
                code: 0,
                message: Constants.RESPONSE_ACCOUNT_ACTIVATED
            });
        })
        .catch(() => {
            return res.json({
                code: -1,
                message: Constants.RESPONSE_UNABLE_TO_PROCESS
            });
        });
    }

    public profile(req: Request, res: Response) {
        const token = req.headers[Constants.TOKEN_HEADER_KEY];
        
        if (!token) {
            return res.json({
                code: -1,
                message: Constants.RESPONSE_INVALID_TOKEN
            });
        }

        let errorMessage = null;
        let user = req.body;

        if (!Validations.isEmailValid(user.email)) {
            errorMessage = Constants.RESPONSE_INVALID_EMAIL;
        }
        else if ('mobile' in user && !Validations.isMobileValid(user.mobile)) {
            errorMessage = Constants.RESPONSE_INVALID_MOBILE;
        }
        else if ('firstName' in user && !Validations.isNameValid(user.firstName)) {
            errorMessage = Constants.RESPONSE_INVALID_FIRST_NAME;
        }
        else if ('lastName' in user && !Validations.isNameValid(user.lastName)) {
            errorMessage = Constants.RESPONSE_INVALID_LAST_NAME;
        }
        else if ('gender' in user && !Validations.isGenderValid(user.gender)) {
            errorMessage = Constants.RESPONSE_INVALID_GENDER;
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
                {$set: {firstName: user.firstName, lastName: user.lastName, mobile: user.mobile, gender: user.gender}}
            )
            .then(_dbResult => {
                if (_dbResult) {
                    return res.json({
                        code: 0,
                        message: Constants.RESPONSE_PROFILE_UPDATED
                    });
                }
                else {
                    return res.json({
                        code: -1,
                        message: Constants.RESPONSE_UNABLE_TO_PROCESS
                    });
                }
            })
            .catch(() => {
                return res.json({
                    code: -1,
                    message: Constants.RESPONSE_UNABLE_TO_PROCESS
                });
            });;
        };

        let tokenController = new TokenController(this.db);
        tokenController.isTokenValid(token.toString(), res)
        .then((_tokenResponse: TokenValidationResponse) => {
            if (!_tokenResponse) {
                return res.json({
                    code: -1,
                    message: Constants.RESPONSE_INVALID_TOKEN
                });
            }
            else {
                res = _tokenResponse.response;
                updateProfile();
            }
        })
        .catch(() => {
            return res.json({
                code: -1,
                message: Constants.RESPONSE_INVALID_TOKEN
            });
        });
    }
}