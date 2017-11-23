import {Router, Request, Response} from 'express';
import {Validations} from '../helper/Validations';
import {Constants} from '../helper/Constants';
import {Db, UpdateWriteOpResult} from 'mongodb';
import {User} from '../models/User';

export class UserController {

    private db: Db;

    constructor(_db: Db) {
        this.db = _db;

        this.login = this.login.bind(this);
        this.register = this.register.bind(this);
    }

    public login(req: Request, res: Response) {
        res.json({
            code: 0,
            message: 'Login',
            data: req.body
        })
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

        if (errorMessage) {
            res.json({
                code: -1,
                message: errorMessage
            });
            return;
        }

        // Insert into DB is not already inserted
        this.db.collection(Constants.dbCollections.user).updateOne({
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
    }
}