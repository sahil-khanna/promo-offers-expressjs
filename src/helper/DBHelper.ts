import { MongoClient, Db, MongoError } from 'mongodb';

class DBHelper {

	public db: Db;

	public connect() {
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