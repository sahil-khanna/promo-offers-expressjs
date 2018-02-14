import { Db } from 'mongodb';
import { Router, Request, Response } from 'express';
import { Constants } from '../helper/Constants';
import { Validations } from '../helper/Validations';
import { dbHelper } from '../helper/DBHelper';
import { TokenController, TokenValidationResponse } from './TokenController';

export class ContributionController {

	constructor() {
		this.add = this.add.bind(this);
		this.get = this.get.bind(this);
	}

	public add(req: Request, res: Response) {
		const token = req.headers[Constants.TOKEN_HEADER_KEY];

		if (!token) {
			return res.json({
				code: -1,
				message: Constants.RESPONSE_INVALID_TOKEN
			});
		}

		let errorMessage = null;
		const contribution = req.body;

		if (!contribution.type) {
			errorMessage = Constants.RESPONSE_INVALID_CONTRIBUTION_TYPE;
		}
		else if (!contribution.cookedOn) {
			errorMessage = Constants.RESPONSE_INVALID_CONTRIBUTION_COOKED_ON;
		}
		else if (!contribution.canServe) {
			errorMessage = Constants.RESPONSE_INVALID_CONTRIBUTION_CAN_SERVE;
		}
		else if (!contribution.isPacked) {
			errorMessage = Constants.RESPONSE_INVALID_CONTRIBUTION_IS_PACKED;
		}
		else if (!contribution.isPacked) {
			errorMessage = Constants.RESPONSE_INVALID_CONTRIBUTION_IS_PACKED;
		}
		else if (!contribution.address) {
			errorMessage = Constants.RESPONSE_INVALID_ADDRESS;
		}
		else if (!Validations.isMobileValid(contribution.mobile)) {
			errorMessage = Constants.RESPONSE_INVALID_MOBILE;
		}

		if (errorMessage) {
			return res.json({
				code: -1,
				message: errorMessage
			});
		}

		const addContribution = () => {
			dbHelper.db.collection(Constants.DB_COLLECTIONS.CONTRIBUTION).insertOne(contribution)
			.then(_dbResult => {
				if (_dbResult) {
					return res.json({
						code: 0,
						message: Constants.RESPONSE_CONTRIBUTION_ADDED
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
			});
		};

		let tokenController = new TokenController(dbHelper.db);
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
				contribution.userId = _tokenResponse.userId;
				addContribution();
			}
		})
		.catch(() => {
			return res.json({
				code: -1,
				message: Constants.RESPONSE_INVALID_TOKEN
			});
		});
	}

	public get(req: Request, res: Response) {
		const token = req.headers[Constants.TOKEN_HEADER_KEY];

		if (!token) {
			return res.json({
				code: -1,
				message: Constants.RESPONSE_INVALID_TOKEN
			});
		}

		// TODO: Add date filters and paging
		// TODO: Add status filters (pending, collected, rejected)

		const findContributions = (_userId: string) => {
			const cursor = dbHelper.db.collection(Constants.DB_COLLECTIONS.CONTRIBUTION).find({userId: _userId});
			const contributions = [];
			cursor.forEach(
				function(contribution: any){
					contributions.push(contribution);
				},
				function(){
					return res.json({
						code: 0,
						data: contributions
					});
				}
			);
			// return res.json({
			//     code: 0.
			//     data: cursor.toArray()
			// })
			
			// .then(_dbResult => {
			//     if (_dbResult) {
			//         return res.json({
			//             code: 0,
			//             message: Constants.RESPONSE_CONTRIBUTION_ADDED
			//         });
			//     }
			//     else {
			//         return res.json({
			//             code: -1,
			//             message: Constants.RESPONSE_UNABLE_TO_PROCESS
			//         });
			//     }
			// })
			// .catch(() => {
			//     return res.json({
			//         code: -1,
			//         message: Constants.RESPONSE_UNABLE_TO_PROCESS
			//     });
			// });;
		};

		let tokenController = new TokenController(dbHelper.db);
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
				findContributions(_tokenResponse.userId);
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