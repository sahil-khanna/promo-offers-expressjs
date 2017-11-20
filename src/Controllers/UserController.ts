import {Router, Request, Response} from 'express';
import {Db} from 'mongodb';

export class UserController {

    private db: Db;

    constructor(_db: Db) {
        this.db = _db;
        console.log(this.db);
    }

    public login(req: Request, res: Response) {
        res.json({
            code: 0,
            message: 'Login',
            data: req.body
        })
    }

    public register(req: Request, res: Response) {
        this.db.collection('user').insert({
            email: req.body.email
        })
        res.json({
            code: 0,
            message: 'Register',
            data: null
        });
    }
}