import { Constants } from './Constants';

export class CryptoHelper {

	private static crypto = require('crypto');

	public static encrypt(text: string) {
		const cipher = this.crypto.createCipher('aes-256-ctr', Constants.PROJECT_SECRET_KEY);
		var crypted = cipher.update(text, 'utf8', 'hex');
		crypted += cipher.final('hex');
		return crypted;
	}

	public static decrypt(text: string) {
		const decipher = this.crypto.createDecipher('aes-256-ctr', Constants.PROJECT_SECRET_KEY);
		var dec = decipher.update(text, 'hex', 'utf8');
		dec += decipher.final('utf8');
		return dec;
	}

	public static hash(text: string) {
		return this.crypto
		.createHash('sha256')
		.update(text, 'utf8')
		.digest('hex');
	}

	public static bycrypt(text: string) {
		const bcrypt = require('bcrypt');
		const saltRounds = 10;

		return new Promise((resolve, reject) => {
			bcrypt.hash(text, saltRounds)
			.then(function(hash: any) {
				resolve(hash);
			});
		});
	}

	public static bycryptCompare(text: string, hash: any) {
		const bcrypt = require('bcrypt');

		return new Promise((resolve, reject) => {
			bcrypt.compare(text, hash)
			.then(function(res: any) {
				resolve(res);
			});
		});
	}
}