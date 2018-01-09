import {Db, UpdateWriteOpResult} from 'mongodb';
import {Constants} from '../helper/Constants';
import {User} from '../models/User';
import {Token} from '../models/Token';
import {Utils} from '../helper/Utils';

export class TokenController {

    private db: Db;

    constructor(_db: Db) {
        this.db = _db;
    }

    private newToken(_user: any) {
        let tokenExpiry: Date = new Date();
        tokenExpiry.setDate(tokenExpiry.getDate() + 2);
        return Utils.btoa(_user.email + '~' + _user._id + '~' + tokenExpiry.getTime().toString());
    }

    /*
     *  Generate a new token and save insert into DB
     */
    public generateToken(_user: User) {
        let token: string = this.newToken({email: _user.email, _id: _user['_id']});

        return new Promise((resolve, reject) => {
            this.db.collection(Constants.DB_COLLECTIONS.TOKEN).insertOne(
                {userId: _user['_id'], token: token, status: true}
            )
            .then(() => {
                resolve(token);
            })
            .catch(() => {
                resolve(null);
            });
        });
    }

    /*
     *  Validate token, and if valid - update in DB
     */
    public isTokenValid(token: string) {
        return new Promise((resolve, reject) => {
            let split = Utils.atob(token).split('~');

            const refreshToken = (token: Token) => {
                let newToken = this.newToken({email: split[0], _id: split[1]});
                this.db.collection(Constants.DB_COLLECTIONS.TOKEN).updateOne(
                    {token: token.token},
                    {$set: {token: newToken}}
                )
                .then(_token => {
                    resolve(newToken);
                })
                .catch(() => {
                    resolve(null);
                });
            };
        
            if (split.length !== 3) {
                return resolve(null);
            }

            if (Number(split[2]) < Date.now()) {
                return resolve(null);
            }

            this.db.collection(Constants.DB_COLLECTIONS.TOKEN).findOne({token: token})
            .then((_token: Token) => {
                if (!_token) {
                    return resolve(null);
                }

                refreshToken(_token);
            })
            .catch(() => {
                resolve(null);
            });
        });
    }
}