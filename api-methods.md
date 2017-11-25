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
	"code": -1,
	"message": "User already registered"
}
```
___
### Login

**URL:** http://localhost:3000/api/1.0/login

**Type:** POST

**Request:**
```javascript
{
	"email": "email@gmail.com",
	"password": "passwordww"
}
```

**Response 1:**
```javascript
{
	"code": 0,
	"message": "Login successful"
}
```

**Response 2:**
```javascript
{
	"code": -1,
	"message": "Invalid username or password"
}
```
___
### Profile

**URL:** http://localhost:3000/api/1.0/profile

**Type:** PUT

**Request:**
```javascript
{
	"email": "email@gmail.com",
	"password": "passwordww",
	"gender": true,
	"firstName": "Hello",
	"lastName": "World"
}

***Header in token***
```

**Response 1:**
```javascript
{
	"code": 0,
	"message": "Data updated"
}
```

**Response 2:**
```javascript
{
	"code": -1,
	"message": "Invalid token"
}
```