// npm i --save express cors morgan mysql aws-sdk mongodb multer uuid dotenv
// npm i --save express-session passport passport-local jsonwebtoken
require('dotenv').config();
const fs = require('fs');
const express = require('express');
const morgan = require('morgan');
const session = require('express-session');
const cors = require('cors');

let config;
if (fs.existsSync('./db/config.js')) { config = require('./db/config'); }
else { config = require('./db/public-config'); }
const { loadConfig, testConnections } = require('./db/initdb');
const conns = loadConfig(config);

// const { initializePassport } = require('./db/passport');
// const passport = initializePassport(conns);
const passport = require('passport');
require('./db/passport')(passport, conns); 

const PORT = parseInt(process.argv[2] || process.env.APP_PORT || process.env.PORT) || 3000;

const app = express();
app.use(morgan('tiny'));
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: config.sessionSecret,
    name: 'session_id',
    resave: true,
    saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(express.static(__dirname + '/public'));
require('./routes/authenticate')(app, passport, conns);
require('./routes/main')(app, conns);
require('./routes/places')(app, conns);
require('./routes/journeys')(app, conns);

app.use((req, resp) => {
    resp.status(404).json({message: `Route not found: ${req.originalUrl}`});
});

testConnections(conns)
	.then(() => {
		app.listen(PORT,
			() => {
				console.info(`Application started on port ${PORT} at ${new Date()}`);
			}
		)
	})
	.catch(error => {
		console.error('Connection Error: ', error);
		process.exit(-1);
	})