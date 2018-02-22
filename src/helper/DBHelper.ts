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
		// MongoClient.connect('mongodb://sahil.khanna:MyPassword@ds135757.mlab.com:35757/user-profile-us', (err, db) => {
		// 	if (err) {
		// 		console.log('mongoose error: ' + err);
		// 	} else {
		// 		console.log('mongoose db: ' + db);

		// 		const user = new User({
		// 			firstName: 'ee',
		// 			lastName: 'ee',
		// 			email: 'eee@fff.com',
		// 			gender: true,
		// 			mobile: '333',
		// 			password: '333',
		// 			isActivated: true
		// 		});

		// 		user.save().then(() => {
		// 			console.log('saved');
		// 		}).catch((err) => {
		// 			console.log('not saved:' + err);
		// 		});
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