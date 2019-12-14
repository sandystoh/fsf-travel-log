const fs = require('fs');
module.exports = {
	mysql: {
		host: 'db-mysql-sgp1-83823-do-user-6853306-0.db.ondigitalocean.com',
		port: 25060,
        user: 'do-user',
        password: '1qazXSW@',
		database: 'travel',
		connectionLimit: 5,
		ssl: {
            ca: fs.readFileSync('D:/src/repos/ca-certificate-2.crt')
        }
	},
	s3: {
		accessKey: 'QL62DESVTZC6CC22ZAHI',
		secret: 'qKrPNzaFLuElhknYXWxornBDB8hsvQrX04Pj1N7jZ8g'
	},
	mongodb: {
		atlasurl: 'mongodb://admin:pafmongo@paf-shard-00-00-9pfah.gcp.mongodb.net:27017,paf-shard-00-01-9pfah.gcp.mongodb.net:27017,paf-shard-00-02-9pfah.gcp.mongodb.net:27017/test?ssl=true&replicaSet=paf-shard-0&authSource=admin&retryWrites=true&w=majority',
		url: 'mongodb://localhost:27017',
	},
	gmaps: {
		key: 'AIzaSyAdKxzddqjXDLiAvhXe_96VSd3U7g4SbgA'
	},
	fb: {
		clientId: '481513579164984',
		clientSecret: '5cf55c551109b35b8ecb5533396ed1c6'
	},
	google: {
		clientId: '498606723050-5oi3jt3jimbtrkbhsa6f2hkbue66caqc.apps.googleusercontent.com',
		clientSecret: '6LJCQlfFAOtK86v7fbpNQRgj'
	},
	sessionSecret: 'fly-me-to-the-moon'
}
