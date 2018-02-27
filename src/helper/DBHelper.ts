import { MongoClient, Db, MongoError } from 'mongodb';
import { User } from '../schema/User';

class DBHelper {

	public db: Db;

	// public connect() {
	// 	return MongoClient.connect('mongodb://sahil.khanna:MyPassword@ds135757.mlab.com:35757/user-profile-us')
	// 	.then((client: MongoClient) => {
	// 		this.db = client.db('user-profile-us');
	// 		console.log('DB Connected');
	// 	})
	// 	.catch((error: MongoError) => {
	// 		console.log('DB Error: ' + error.message);
	// 	});
	// }

	public connect() {
		// const mongoose = require('mongoose');
		// mongoose.connect('mongodb://sahil.khanna:MyPassword@ds135757.mlab.com:35757/user-profile-us', function(err) {
		// 	if (err) {
		// 		console.log('EB error: ' + err);
		// 	} else {
		// 		console.log('DB connected');
		// 	}
		// });

		return MongoClient.connect('mongodb://sahil.khanna:MyPassword@ds135757.mlab.com:35757/user-profile-us')
		.then((client: MongoClient) => {
			this.db = client.db('user-profile-us');
			console.log('DB Connected');
		})
		.catch((error: MongoError) => {
			console.log('DB Error: ' + error.message);
		});
	}
}

export const dbHelper = new DBHelper();