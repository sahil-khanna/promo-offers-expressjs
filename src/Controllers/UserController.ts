import { Router, Request, Response } from 'express';
import { Validations } from '../helper/Validations';
import { Constants } from '../helper/Constants';
import { UpdateWriteOpResult } from 'mongodb';
// import { User } from '../models/User';
import { IUser } from '../models/IUser';
import { CryptoHelper } from '../helper/CryptoHelper';
import { Utils } from '../helper/Utils';
import { TokenController, TokenValidationResponse } from './TokenController';
import { dbHelper } from '../helper/DBHelper';
import { Validator } from 'express-validator';
import { check } from 'express-validator/check';

export class UserController {

	public login(req: Request, res: Response) {
		const user: IUser = {
			email: req.body.email,
			password: req.body.password
		};

		req.checkBody('email', Constants.RESPONSE_INVALID_EMAIL).isEmail();
		req.checkBody('password', Constants.RESPONSE_INVALID_PASSWORD).exists();

		const errors: any = req.validationErrors();

		if (errors !== false) {
			return res.json({
				code: -1,
				message: errors[0].msg
			});
		}

		const generateToken = (_user: IUser) => {
			const tokenController = new TokenController(dbHelper.db);
			tokenController.generateToken(_user)
				.then(_token => {
					const userProfile: any = {
						id: _user['_id'],
						firstName: _user.firstName,
						lastName: _user.lastName,
						email: _user.email,
						mobile: _user.mobile,
						gender: _user.gender
					};

					if (_user.imagePath) {
						userProfile.imageURL = Constants.SELF_URL + '/' + _user.imagePath;
					}

					res.json({
						code: 0,
						data: {
							token: _token,
							profile: userProfile,
							roleId: _user.roleId
						}
					});
				});
		};

		dbHelper.db.collection(Constants.DB_COLLECTIONS.USER).findOne({
			email: user.email,
			password: CryptoHelper.hash(user.password),
		})
			.then(_dbResult => {
				if (!_dbResult) {
					return res.json({
						code: -1,
						message: Constants.RESPONSE_INVALID_USERNAME_OR_PASSWORD
					});
				} else if (!_dbResult.isActivated) {
					return res.json({
						code: -1,
						message: Constants.RESPONSE_ACCOUNT_NOT_ACTIVATED
					});
				} else {
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

		dbHelper.db.collection(Constants.DB_COLLECTIONS.TOKEN).updateOne(
			{ token: token, status: true },
			{ $set: { status: false } }
		)
			.then(_dbResult => {
				if (!_dbResult) {
					return res.json({
						code: -1,
						message: Constants.RESPONSE_INVALID_TOKEN
					});
				} else {
					return res.json({
						code: 0,
						message: Constants.RESPONSE_LOGGED_OUT
					});
				}
			});
	}

	public register(req: Request, res: Response) {
		let errorMessage = null;
		const user: IUser = {
			email: req.body.email,
			password: req.body.password,
			mobile: req.body.mobile,
			gender: req.body.gender,
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			roleId: req.body.roleId
		};

		if (!Validations.isEmailValid(user.email)) {
			errorMessage = Constants.RESPONSE_INVALID_EMAIL;
		} else if (!Validations.isMobileValid(user.mobile)) {
			errorMessage = Constants.RESPONSE_INVALID_MOBILE;
		} else if (!Validations.isNameValid(user.firstName)) {
			errorMessage = Constants.RESPONSE_INVALID_FIRST_NAME;
		} else if (!Validations.isNameValid(user.lastName)) {
			errorMessage = Constants.RESPONSE_INVALID_LAST_NAME;
		} else if (!Validations.isGenderValid(user.gender)) {
			errorMessage = Constants.RESPONSE_INVALID_GENDER;
		} else if (Utils.nullToObject(user.password, '').length === 0) {
			errorMessage = Constants.RESPONSE_INVALID_PASSWORD;
		} else if ('roleId' in user === false) {
			errorMessage = Constants.RESPONSE_INVALID_ROLE;
		}

		if (errorMessage) {
			return res.json({
				code: -100,
				message: errorMessage
			});
		}

		user.activationKey = CryptoHelper.hash(user.email + Date.now());    // To make the activation key unique
		user.isActivated = false;
		user.password = CryptoHelper.hash(user.password);

		// Insert into DB if not already inserted
		dbHelper.db.collection(Constants.DB_COLLECTIONS.USER).updateOne(
			{ email: user.email },
			{ $setOnInsert: user },
			{ upsert: true }
		)
			.then(_dbResult => {
				if ('upserted' in _dbResult.result) {
					res.json({
						code: 0,
						message: Constants.RESPONSE_USER_REGISTERED,
						data: 'http://localhost:4200/activate-account/' + user.activationKey
					});
				} else {
					res.json({
						code: -1,
						message: Constants.RESPONSE_EMAIL_ALREADY_REGISTERED
					});
				}
			});
	}

	public forgotPassword(req: Request, res: Response) {
		const params: any = Utils.deparam(req.params[0]);

		if (!Validations.isEmailValid(params.email)) {
			return res.json({
				code: -1,
				message: Constants.RESPONSE_INVALID_EMAIL
			});
		}

		const passwordKey = CryptoHelper.hash(params.email + Date.now());    // To make the password key unique

		dbHelper.db.collection(Constants.DB_COLLECTIONS.USER).findOneAndUpdate(
			{ email: params.email, isActivated: true },
			{ $set: { passwordKey: passwordKey } }
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
		} else if (body.passwordKey) {
			criteria.passwordKey = body.passwordKey;
		} else if (body.email) {
			criteria.email = body.email;
		} else {
			return res.json({
				code: -1,
				message: Constants.RESPONSE_INVALID_PARAMETERS
			});
		}

		dbHelper.db.collection(Constants.DB_COLLECTIONS.USER).findOneAndUpdate(
			criteria,
			{ $set: { password: CryptoHelper.hash(body.password), passwordKey: null } }
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
		const params: any = Utils.deparam(req.params[0]);

		if (!params.key) {
			return res.json({
				code: -1,
				message: Constants.RESPONSE_INVALID_ACTIVATION_KEY
			});
		}

		dbHelper.db.collection(Constants.DB_COLLECTIONS.USER).findOneAndUpdate(
			{ activationKey: params.key, isActivated: false },
			{ $set: { isActivated: true } }
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
		const user = req.body;

		if (!Validations.isEmailValid(user.email)) {
			errorMessage = Constants.RESPONSE_INVALID_EMAIL;
		} else if ('mobile' in user && !Validations.isMobileValid(user.mobile)) {
			errorMessage = Constants.RESPONSE_INVALID_MOBILE;
		} else if ('firstName' in user && !Validations.isNameValid(user.firstName)) {
			errorMessage = Constants.RESPONSE_INVALID_FIRST_NAME;
		} else if ('lastName' in user && !Validations.isNameValid(user.lastName)) {
			errorMessage = Constants.RESPONSE_INVALID_LAST_NAME;
		} else if ('gender' in user && !Validations.isGenderValid(user.gender)) {
			errorMessage = Constants.RESPONSE_INVALID_GENDER;
		}

		if (errorMessage) {
			return res.json({
				code: -1,
				message: errorMessage
			});
		}

		const updateProfile = () => {
			const toBeUpdated: any = {
				firstName: user.firstName,
				lastName: user.lastName,
				mobile: user.mobile,
				gender: user.gender
			};
			if (user.image) {
				toBeUpdated.imagePath = user.image;
			}

			dbHelper.db.collection(Constants.DB_COLLECTIONS.USER).findOneAndUpdate(
				{ email: user.email },
				{ $set: toBeUpdated }
			)
				.then((_dbResult: any) => {
					if (_dbResult) {
						const _updatedUser = _dbResult.value;
						const updatedProfile: any = {
							id: _updatedUser['_id'],
							firstName: _updatedUser.firstName,
							lastName: _updatedUser.lastName,
							email: _updatedUser.email,
							mobile: _updatedUser.mobile,
							gender: _updatedUser.gender
						};

						if (_updatedUser.imagePath) {
							updatedProfile.imageURL = Constants.SELF_URL + '/' + _updatedUser.imagePath;
						}
						return res.json({
							code: 0,
							message: Constants.RESPONSE_PROFILE_UPDATED,
							data: updatedProfile
						});
					} else {
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
				});
		};

		const saveImage = () => {
			if (user.image) {
				const base64Data = user.image.replace(/^data:image\/png;base64,/, '');
				const fileName = Date.now() + '.png';

				require('fs').writeFile(Constants.FILE_UPLOAD_PATH + fileName, base64Data, 'base64', function (err) {
					if (err) {
						user.image = null;
					} else {
						user.image = Constants.FILE_UPLOAD_PATH + fileName;
					}

					updateProfile();
				});
			} else {
				updateProfile();
			}
		};

		const tokenController = new TokenController(dbHelper.db);
		tokenController.isTokenValid(token.toString(), res)
			.then((_tokenResponse: TokenValidationResponse) => {
				if (!_tokenResponse) {
					return res.json({
						code: -1,
						message: Constants.RESPONSE_INVALID_TOKEN
					});
				} else {
					res = _tokenResponse.response;
					saveImage();
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