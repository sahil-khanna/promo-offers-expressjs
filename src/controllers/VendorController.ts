import { IVendor } from '../models/IVendor';
import { Request, Response } from 'express';
import { Validations } from '../helper/Validations';
import { Constants } from '../helper/Constants';
import { Utils } from '../helper/Utils';
import { dbHelper } from '../helper/DBHelper';
import { constants } from 'fs';
import { TokenController, TokenValidationResponse } from './TokenController';
import { ObjectId } from 'bson';
// import { ObjectId } from 'mongodb';

export class VendorController {

	public add(req: Request, res: Response) {
		const token = req.headers[Constants.TOKEN_HEADER_KEY];

		if (!token) {
			return res.json({
				code: -1,
				message: Constants.RESPONSE_INVALID_TOKEN
			});
		}

		const vendor: IVendor = {
			name: req.body.name,
			image: req.body.image,
			email: req.body.email,
			website: req.body.website,
			description: req.body.description,
			status: true,
			isEnabled: true
		};

		let errorMessage;
		if (!Validations.isNameValid(vendor.name)) {
			errorMessage = Constants.RESPONSE_INVALID_NAME;
		} else if (vendor.email && !Validations.isEmailValid(vendor.email)) {
			errorMessage = Constants.RESPONSE_INVALID_EMAIL;
		} else if (Utils.nullToObject(vendor.image, '').length === 0) {
			errorMessage = Constants.RESPONSE_INVALID_IMAGE;
		} else if (vendor.description && vendor.description.length === 0) {
			errorMessage = Constants.RESPONSE_INVALID_DESCRIPTION;
		} else if (vendor.website && vendor.website.length === 0) {
			errorMessage = Constants.RESPONSE_INVALID_WEBSITE;
		}

		if (errorMessage) {
			return res.json({
				code: -1,
				message: errorMessage
			});
		}

		const insertIntoDB = () => {
			// Insert into DB if not already inserted
			dbHelper.db.collection(Constants.DB_COLLECTIONS.VENDOR).updateOne(
				{ email: vendor.email },
				{ $setOnInsert: vendor },
				{ upsert: true }
			)
				.then(_dbResult => {
					if ('upserted' in _dbResult.result) {
						res.json({
							code: 0,
							message: Constants.RESPONSE_VENDOR_ADDED
						});
					} else {
						res.json({
							code: -1,
							message: Constants.RESPONSE_EMAIL_ALREADY_REGISTERED
						});
					}
				});
		};

		const saveImage = () => {
			if (vendor.image) {
				const base64Data = vendor.image.replace(/^data:image\/png;base64,/, '');
				const fileName = Date.now() + '.png';

				require('fs').writeFile(Constants.FILE_UPLOAD_PATH + fileName, base64Data, 'base64', function (err: any) {
					if (err) {
						vendor.image = null;
					} else {
						vendor.image = Constants.FILE_UPLOAD_PATH + fileName;
					}

					insertIntoDB();
				});
			} else {
				insertIntoDB();
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

	public update(req: Request, res: Response) {
		const token = req.headers[Constants.TOKEN_HEADER_KEY];

		if (!token) {
			return res.json({
				code: -1,
				message: Constants.RESPONSE_INVALID_TOKEN
			});
		}

		const vendor: IVendor = {
			name: req.body.name,
			image: req.body.image,
			website: req.body.website,
			description: req.body.description,
			status: true,
			isEnabled: req.body.isEnabled
		};

		let errorMessage;
		if (!Validations.isNameValid(vendor.name)) {
			errorMessage = Constants.RESPONSE_INVALID_NAME;
		} else if (vendor.email && !Validations.isEmailValid(vendor.email)) {
			errorMessage = Constants.RESPONSE_INVALID_EMAIL;
		} else if (Utils.nullToObject(vendor.image, '').length === 0) {
			errorMessage = Constants.RESPONSE_INVALID_IMAGE;
		} else if (vendor.description && vendor.description.length === 0) {
			errorMessage = Constants.RESPONSE_INVALID_DESCRIPTION;
		} else if (vendor.website && vendor.website.length === 0) {
			errorMessage = Constants.RESPONSE_INVALID_WEBSITE;
		} else if (Utils.nullToObject(req.body.id, '').length === 0) {
			errorMessage = Constants.RESPONSE_UNABLE_TO_PROCESS;
		} else if (typeof vendor.isEnabled !== 'boolean') {
			errorMessage = Constants.RESPONSE_UNABLE_TO_PROCESS;
		}

		if (errorMessage) {
			return res.json({
				code: -1,
				message: errorMessage
			});
		}

		const updateIntoDB = () => {
			console.log(req.body.id);
			dbHelper.db.collection(Constants.DB_COLLECTIONS.VENDOR).updateOne(
				{ '_id': new ObjectId(req.body.id) },
				{ $set: vendor }
			)
				.then(_dbResult => {
					res.json({
						code: 0,
						message: Constants.RESPONSE_INFORMATION_UPDATED
					});
				})
				.catch(() => {
					res.json({
						code: 0,
						message: Constants.RESPONSE_UNABLE_TO_PROCESS
					});
				});
		};

		const saveImage = () => {
			if (vendor.image && vendor.image !== 'no_change') {
				console.log(vendor.image);
				const base64Data = vendor.image.replace(/^data:image\/png;base64,/, '');
				const fileName = Date.now() + '.png';

				require('fs').writeFile(Constants.FILE_UPLOAD_PATH + fileName, base64Data, 'base64', function (err: any) {
					if (err) {
						vendor.image = null;
					} else {
						vendor.image = Constants.FILE_UPLOAD_PATH + fileName;
					}

					updateIntoDB();
				});
			} else {
				delete vendor.image;
				updateIntoDB();
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

	public list(req: Request, res: Response) {
		const token = req.headers[Constants.TOKEN_HEADER_KEY];

		if (!token) {
			return res.json({
				code: -1,
				message: Constants.RESPONSE_INVALID_TOKEN
			});
		}

		const params: any = Utils.deparam(req.params[0]);
		const skip = parseInt(Utils.nullToObject(params.skip, 0));
		let limit = parseInt(Utils.nullToObject(params.skip, 20));
		limit = (limit > 20) ? 20 : limit;

		const vendors = [];
		// TODO: Remove unwanted columns using projections
		dbHelper.db.collection(Constants.DB_COLLECTIONS.VENDOR).find({ status: true }).skip(skip).limit(limit).toArray()
			.then((_dbResult: any[]) => {
					_dbResult.forEach(element => {
						element.image = Constants.SELF_URL + '/' + element.image;
					});
					res.json({
						code: 0,
						data: _dbResult
					});
				}
			)
			.catch((err) => {
				res.json({
					code: -1,
					message: err.message
				});
			});
	}

	public delete(req: Request, res: Response) {
		const token = req.headers[Constants.TOKEN_HEADER_KEY];

		if (!token) {
			return res.json({
				code: -1,
				message: Constants.RESPONSE_INVALID_TOKEN
			});
		}

		const params: any = Utils.deparam(req.params[0]);

		if (Utils.nullToObject(params.id, '').length === 0) {
			return res.json({
				code: -1,
				message: Constants.RESPONSE_UNABLE_TO_PROCESS
			});
		}

		const updateIntoDB = () => {
			dbHelper.db.collection(Constants.DB_COLLECTIONS.VENDOR).updateOne(
				{ '_id': new ObjectId(params.id) },
				{ $set: { status: false} }
			)
				.then(_dbResult => {
					console.log(_dbResult);
					res.json({
						code: 0,
						message: Constants.RESPONSE_RECORD_DELETED
					});
				})
				.catch(() => {
					res.json({
						code: 0,
						message: Constants.RESPONSE_UNABLE_TO_PROCESS
					});
				});
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
					updateIntoDB();
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