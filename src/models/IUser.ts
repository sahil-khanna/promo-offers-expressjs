import { ObjectId } from 'bson';

export interface IUser {
	id?: ObjectId;
	firstName?: string;
	lastName?: string;
	email: string;
	gender?: boolean;    // True = male, False = female
	mobile?: string;
	password?: string;
	activationKey?: string;
	isActivated?: boolean;
	imagePath?: string;
	roleId?: number;
}