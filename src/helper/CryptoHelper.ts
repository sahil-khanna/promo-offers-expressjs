import {Constants} from './Constants';

export class CryptoHelper {
    
    private static crypto = require('crypto');
    private static algorithm = 'aes-256-ctr';
    
    public static encrypt(text: string) {
        var cipher = this.crypto.createCipher(this.algorithm, Constants.PROJECT_SECRET_KEY)
        var crypted = cipher.update(text,'utf8', 'hex')
        crypted += cipher.final('hex');
        return crypted;
    }

    public static decrypt(text: string) {
        var decipher = this.crypto.createDecipher(this.algorithm, Constants.PROJECT_SECRET_KEY)
        var dec = decipher.update(text,'hex', 'utf8')
        dec += decipher.final('utf8');
        return dec;
    }

    public static bycrypt(text: string) {
        var bcrypt = require('bcrypt');
        const saltRounds = 10;
        
        return new Promise((resolve, reject) => {
            bcrypt.hash(text, saltRounds)
            .then(function(hash) {
                resolve(hash);
            });
        });
    }

    public static bycryptCompare(text: string, hash: any) {
        var bcrypt = require('bcrypt');
        
        return new Promise((resolve, reject) => {
            bcrypt.compare(text, hash)
            .then(function(res) {
                resolve(res);
            });
        });
    }
}