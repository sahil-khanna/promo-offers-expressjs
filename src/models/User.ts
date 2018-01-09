import { Utils } from '../helper/Utils';

//TODO: Add dob, created and modified dates as well

export class User {
    firstName: string;
    lastName: string;
    email: string;
    gender: boolean;    // True = male, False = female
    mobile: string;
    password: string;
    activationKey?: string;
    isActivated?: boolean;

    constructor(_user) {
        if (_user) {
            this.firstName = _user.firstName;
            this.lastName = _user.lastName;
            this.email = _user.email;
            this.mobile = _user.mobile;
            this.gender = _user.gender;
            this.password = _user.password;
        }
    }
}