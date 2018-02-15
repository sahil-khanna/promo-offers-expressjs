import { Db, UpdateWriteOpResult } from 'mongodb';
import { Constants } from '../helper/Constants';
import { IUser } from '../models/IUser';
import { Token } from '../models/Token';
import { Utils } from '../helper/Utils';
import { Response } from 'express';

export interface TokenValidationResponse {
	response: Response;
	userId: string;
}

export class TokenController {

	private db: Db;

	constructor(_db: Db) {
		this.db = _db;
	}

	private newToken(_user: any) {
		const tokenExpiry: Date = new Date();
		tokenExpiry.setDate(tokenExpiry.getDate() + 2);
		return Utils.btoa(_user.email + '~' + _user._id + '~' + tokenExpiry.getTime().toString());
	}

	/*
	 *  Generate a new token and save insert into DB
	 */
	public generateToken(_user: IUser) {
		const token: string = this.newToken({email: _user.email, _id: _user['_id']});

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
	public isTokenValid(oldToken: string, res: Response) {
		return new Promise((resolve, reject) => {
			if (oldToken === null) {
				return resolve(null);
			}

			const split = Utils.atob(oldToken).split('~');
			if (split.length !== 3) {
				return resolve(null);
			} else if (Number(split[2]) < Date.now()) {
				return resolve(null);
			}

			const newToken = this.newToken({email: split[0], _id: split[1]});
			this.db.collection(Constants.DB_COLLECTIONS.TOKEN).findOneAndUpdate(
				{token: oldToken, status: true},
				{$set: {token: newToken}}
			)
			.then((_dbResult) => {
				if (!_dbResult) {
					return resolve(null);
				}

				// Send this new token in response header
				res.setHeader('access-control-expose-headers', Constants.TOKEN_HEADER_KEY);
				res.setHeader(Constants.TOKEN_HEADER_KEY, newToken);

				resolve({response: res, userId: _dbResult.value.userId.toString()});
			})
			.catch(() => {
				resolve(null);
			});
		});
	}
}