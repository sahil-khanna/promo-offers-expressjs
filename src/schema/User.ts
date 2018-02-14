// Reference: http://www.ramlez.com/blog/node-js-typescript-2-x-mongodb-quick-start-2/

import { Document, Schema, model, Model,  } from 'mongoose';

export interface IUser {
	firstName: string;
	lastName: string;
	email: string;
	gender: boolean;    // True = male, False = female
	mobile: string;
	password: string;
	activationKey?: string;
	isActivated?: boolean;
	imagePath?: string;
}

export interface IUserModel extends IUser, Document { }

const schema: Schema = new Schema({
	firstName: {
		type: String,
		required: true
	},
	lastName: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	gender: {
		type: Boolean,
		required: true
	},
	mobile: {
		type: String,
		required: false
	},
	password: {
		type: String,
		required: true
	},
	activationKey: {
		type: String,
		required: false
	},
	isActivated: {
		type: Boolean,
		required: true
	},
	imagePath: {
		type: String,
		required: false
	},
}, {
	timestamps: true
});

export const User: Model<IUserModel> = model<IUserModel>('user', schema);