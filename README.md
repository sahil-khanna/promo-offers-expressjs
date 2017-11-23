# user-profile-expressjs
User Profile is a clean, simple and minimal REST API to create your own profile and store information about yourself. It is developed on ExpressJS + MongoDB + TypeScript


Below are the API methods that can be used

___
### Register User

**URL:** http://localhost:3000/api/1.0/register

**Type:** POST

**Request:**
```javascript
{
	"email": "email@gmail.com",
	"password": "passwordww",
	"mobile": "7876543210",
	"firstName": "Helleeeossssss",
	"lastName": "Hellossssss",
	"gender": true
}
```

**Response 1:**
```javascript
{
	"code": 0,
	"message": "User registered"
}
```

**Response 2:**
```javascript
{
	"code": 0,
	"message": "User already registered"
}
```
