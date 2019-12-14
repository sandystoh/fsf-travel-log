require('dotenv').config();
const fs = require('fs');
module.exports = {
	mysql: {
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
		database: 'travel',
		connectionLimit: 4,
		ssl: {
            ca: process.env.DB_CA // fs.readFileSync('D:/src/repos/ca-certificate-2.crt') 
        }
	},
	s3: {
		accessKey: process.env.ACCESS_KEY,
		secret: process.env.SECRET_ACCESS_KEY
	},
	mongodb: {
		atlasurl: process.env.ATLAS_URL,
		url: process.env.MONGO_URL
	},
	gmaps: {
		key: process.env.GMAPS_KEY
	},
	fb: {
		clientId: process.env.FB_ID,
		clientSecret: process.env.FB_SECRET
	},
	google: {
		clientId: process.env.GOOGLE_CLIENT_ID,
		clientSecret: process.env.GOOGLE_CLIENT_SECRET
	},
	sessionSecret: process.env.SESSION_SECRET
}
