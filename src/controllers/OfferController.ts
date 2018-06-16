import { IOffer } from '../models/IOffer';
import { Request, Response } from 'express';
import { Validations } from '../helper/Validations';
import { Constants } from '../helper/Constants';
import { Utils } from '../helper/Utils';
import { dbHelper } from '../helper/DBHelper';
import { constants } from 'fs';
import { TokenController, TokenValidationResponse } from './TokenController';
import { ObjectId } from 'bson';
import { check } from 'express-validator/check';

export class OfferController {

	public add(req: Request, res: Response) {
		req.checkHeaders(Constants.TOKEN_HEADER_KEY, Constants.RESPONSE_INVALID_TOKEN).exists();
		req.checkBody('title', Constants.RESPONSE_INVALID_TITLE).isLength({min: 5, max: 50});
		req.checkBody('description', Constants.RESPONSE_INVALID_DESCRIPTION).isLength({min: 20, max: 200});
		req.checkBody('offerStart', Constants.RESPONSE_INVALID_START_DATE).isLength({min: 10, max: 10});
		req.checkBody('offerEnd', Constants.RESPONSE_INVALID_END_DATE).isLength({min: 10, max: 10});
		req.checkBody('type', Constants.RESPONSE_INVALID_TYPE).isIn(['amount', 'percent']);
		req.checkBody('minPurchaseAmount', Constants.RESPONSE_INVALID_MIN_PURCHASE_AMOUNT).isNumeric();
		req.checkBody('vendorId', Constants.RESPONSE_INVALID_VENDOR).exists();

		let errors: any = req.validationErrors();

		if (errors !== false) {
			return res.json({
				code: -1,
				message: errors[0].msg
			});
		}

		if (req.body.type === 'amount') {
			req.checkBody('fixedDiscountAmount', Constants.RESPONSE_INVALID_FIXED_DISCOUNT_AMOUNT).isNumeric();
		} else {
			req.checkBody('maxDiscountAmount', Constants.RESPONSE_INVALID_MAX_DISCOUNT_AMOUNT).isNumeric();
			req.checkBody('discountPercent', Constants.RESPONSE_INVALID_DISCOUNT_PERCENT).isNumeric();
		}

		errors = req.validationErrors();

		if (errors !== false) {
			return res.json({
				code: -1,
				message: errors[0].msg
			});
		}

		const token = req.headers[Constants.TOKEN_HEADER_KEY];
		const offer: IOffer = {
			title: req.body.title,
			description: req.body.description,
			offerStart: req.body.offerStart,
			offerEnd: req.body.offerEnd,
			type: req.body.type,
			minPurchaseAmount: req.body.minPurchaseAmount,
			status: true,
			isEnabled: true,
			vendorId: req.body.vendorId
		};

		if (offer.type === 'percent') {
			offer.discountPercent = req.body.discountPercent;
			offer.maxDiscountAmount = req.body.maxDiscountAmount;
		} else {
			offer.fixedDiscountAmount = req.body.fixedDiscountAmount;
		}

		const insertIntoDB = () => {
			dbHelper.db.collection(Constants.DB_COLLECTIONS.OFFER).insertOne(offer)
				.then(() => {
					res.json({
						code: 0,
						message: Constants.RESPONSE_OFFER_ADDED
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
					insertIntoDB();
				}
			})
			.catch(() => {
				return res.json({
					code: -1,
					message: Constants.RESPONSE_INVALID_TOKEN
				});
			});
	}

	// public update(req: Request, res: Response) {
	// 	const token = req.headers[Constants.TOKEN_HEADER_KEY];

	// 	if (!token) {
	// 		return res.json({
	// 			code: -1,
	// 			message: Constants.RESPONSE_INVALID_TOKEN
	// 		});
	// 	}

	// 	const vendor: IVendor = {
	// 		name: req.body.name,
	// 		image: req.body.image,
	// 		website: req.body.website,
	// 		description: req.body.description,
	// 		status: true,
	// 		isEnabled: req.body.isEnabled
	// 	};

	// 	let errorMessage;
	// 	if (!Validations.isNameValid(vendor.name)) {
	// 		errorMessage = Constants.RESPONSE_INVALID_NAME;
	// 	} else if (vendor.email && !Validations.isEmailValid(vendor.email)) {
	// 		errorMessage = Constants.RESPONSE_INVALID_EMAIL;
	// 	} else if (Utils.nullToObject(vendor.image, '').length === 0) {
	// 		errorMessage = Constants.RESPONSE_INVALID_IMAGE;
	// 	} else if (vendor.description && vendor.description.length === 0) {
	// 		errorMessage = Constants.RESPONSE_INVALID_DESCRIPTION;
	// 	} else if (vendor.website && vendor.website.length === 0) {
	// 		errorMessage = Constants.RESPONSE_INVALID_WEBSITE;
	// 	} else if (Utils.nullToObject(req.body.id, '').length === 0) {
	// 		errorMessage = Constants.RESPONSE_UNABLE_TO_PROCESS;
	// 	} else if (typeof vendor.isEnabled !== 'boolean') {
	// 		errorMessage = Constants.RESPONSE_UNABLE_TO_PROCESS;
	// 	}

	// 	if (errorMessage) {
	// 		return res.json({
	// 			code: -1,
	// 			message: errorMessage
	// 		});
	// 	}

	// 	const updateIntoDB = () => {
	// 		console.log(req.body.id);
	// 		dbHelper.db.collection(Constants.DB_COLLECTIONS.VENDOR).updateOne(
	// 			{ '_id': new ObjectId(req.body.id) },
	// 			{ $set: vendor }
	// 		)
	// 			.then(_dbResult => {
	// 				res.json({
	// 					code: 0,
	// 					message: Constants.RESPONSE_INFORMATION_UPDATED
	// 				});
	// 			})
	// 			.catch(() => {
	// 				res.json({
	// 					code: 0,
	// 					message: Constants.RESPONSE_UNABLE_TO_PROCESS
	// 				});
	// 			});
	// 	};

	// 	const saveImage = () => {
	// 		if (vendor.image && vendor.image !== 'no_change') {
	// 			console.log(vendor.image);
	// 			const base64Data = vendor.image.replace(/^data:image\/png;base64,/, '');
	// 			const fileName = Date.now() + '.png';

	// 			require('fs').writeFile(Constants.FILE_UPLOAD_PATH + fileName, base64Data, 'base64', function (err: any) {
	// 				if (err) {
	// 					vendor.image = null;
	// 				} else {
	// 					vendor.image = Constants.FILE_UPLOAD_PATH + fileName;
	// 				}

	// 				updateIntoDB();
	// 			});
	// 		} else {
	// 			delete vendor.image;
	// 			updateIntoDB();
	// 		}
	// 	};

	// 	const tokenController = new TokenController(dbHelper.db);
	// 	tokenController.isTokenValid(token.toString(), res)
	// 		.then((_tokenResponse: TokenValidationResponse) => {
	// 			if (!_tokenResponse) {
	// 				return res.json({
	// 					code: -1,
	// 					message: Constants.RESPONSE_INVALID_TOKEN
	// 				});
	// 			} else {
	// 				res = _tokenResponse.response;
	// 				saveImage();
	// 			}
	// 		})
	// 		.catch(() => {
	// 			return res.json({
	// 				code: -1,
	// 				message: Constants.RESPONSE_INVALID_TOKEN
	// 			});
	// 		});
	// }

	// public list(req: Request, res: Response) {
	// 	const token = req.headers[Constants.TOKEN_HEADER_KEY];

	// 	if (!token) {
	// 		return res.json({
	// 			code: -1,
	// 			message: Constants.RESPONSE_INVALID_TOKEN
	// 		});
	// 	}

	// 	const params: any = Utils.deparam(req.params[0]);
	// 	const skip = parseInt(Utils.nullToObject(params.skip, 0));
	// 	let limit = parseInt(Utils.nullToObject(params.skip, 20));
	// 	limit = (limit > 20) ? 20 : limit;

	// 	const vendors = [];
	// 	// TODO: Remove unwanted columns using projections
	// 	dbHelper.db.collection(Constants.DB_COLLECTIONS.VENDOR).find({ status: true }).skip(skip).limit(limit).toArray()
	// 		.then((_dbResult: any[]) => {
	// 				_dbResult.forEach(element => {
	// 					element.image = Constants.SELF_URL + '/' + element.image;
	// 				});
	// 				res.json({
	// 					code: 0,
	// 					data: _dbResult
	// 				});
	// 			}
	// 		)
	// 		.catch((err) => {
	// 			res.json({
	// 				code: -1,
	// 				message: err.message
	// 			});
	// 		});
	// }

	// public delete(req: Request, res: Response) {
	// 	const token = req.headers[Constants.TOKEN_HEADER_KEY];

	// 	if (!token) {
	// 		return res.json({
	// 			code: -1,
	// 			message: Constants.RESPONSE_INVALID_TOKEN
	// 		});
	// 	}

	// 	const params: any = Utils.deparam(req.params[0]);

	// 	if (Utils.nullToObject(params.id, '').length === 0) {
	// 		return res.json({
	// 			code: -1,
	// 			message: Constants.RESPONSE_UNABLE_TO_PROCESS
	// 		});
	// 	}

	// 	const updateIntoDB = () => {
	// 		dbHelper.db.collection(Constants.DB_COLLECTIONS.VENDOR).updateOne(
	// 			{ '_id': new ObjectId(params.id) },
	// 			{ $set: { status: false} }
	// 		)
	// 			.then(_dbResult => {
	// 				console.log(_dbResult);
	// 				res.json({
	// 					code: 0,
	// 					message: Constants.RESPONSE_RECORD_DELETED
	// 				});
	// 			})
	// 			.catch(() => {
	// 				res.json({
	// 					code: 0,
	// 					message: Constants.RESPONSE_UNABLE_TO_PROCESS
	// 				});
	// 			});
	// 	};

	// 	const tokenController = new TokenController(dbHelper.db);
	// 	tokenController.isTokenValid(token.toString(), res)
	// 		.then((_tokenResponse: TokenValidationResponse) => {
	// 			if (!_tokenResponse) {
	// 				return res.json({
	// 					code: -1,
	// 					message: Constants.RESPONSE_INVALID_TOKEN
	// 				});
	// 			} else {
	// 				res = _tokenResponse.response;
	// 				updateIntoDB();
	// 			}
	// 		})
	// 		.catch(() => {
	// 			return res.json({
	// 				code: -1,
	// 				message: Constants.RESPONSE_INVALID_TOKEN
	// 			});
	// 		});
	// }
}