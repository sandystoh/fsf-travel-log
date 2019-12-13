const mydb = require('../db/mydbutil');
const fs = require('fs');
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
const { google } = require('googleapis');
const jwt = require('jsonwebtoken');

module.exports = function(app, passport, conns) {

    const GET_USER_DETAILS = 'select username, email, display_name from users where username = ?';
    const getUserDetails = mydb.mkQuery(GET_USER_DETAILS, conns.mysql);
    // const saveJWToken = mydb.mkQuery('update users set jwt_token = ? where username = ?', conns.mysql)

    app.post('/api/authenticate', 
    passport.authenticate('local', {
        failureRedirect: '/error.html'
        // ,session: false
    }),
    (req, resp) => {
        getUserDetails([ req.user ])
            .then(r => {
                const d = new Date()
                const rec = r.result[0];
                const token = jwt.sign({
                    sub: rec.username,
                    iss: 'fsf-travel-app',
                    iat: d.getTime()/1000,
                    exp: (d.getTime()/1000) + (60 * 60)
                }, conns.secret);
                req.session.token = token;
                resp.format({
                    'text/html': () => {
                        resp.redirect('/'); //`/client?access_token=${req.session.token}`)
                    },
                    'application/json': () => {
                        resp.status(200).json({
                            token_type: 'Bearer',
                            access_token: token,
                            username: rec.username,
                            display_name: rec.display_name
                        })
                    },
                    'default': () => {
                        resp.redirect('/')
                    }
                })
            }) 
    }
)

    
    const getGoogleToken = mydb.mkQuery('select google_token from users where username = ?', conns.mysql);
    app.get('/api/link/google', function (req, resp, next) {
        let username = '';
        const authorization = req.get('Authorization');
        if (!(authorization && authorization.startsWith('Bearer ')))
            return resp.status(403).json({ message: 'not authorized' })
        const tokenStr = authorization.substring('Bearer '.length);

        try {
            var decoded = jwt.verify(tokenStr, conns.secret);
            username = decoded.sub;
            getGoogleToken([username])
            .then(r => {
                console.log('FIND USER TOKEN RESULT', r.result);
                if(!r.result[0].google_token) {
                    //resp.redirect('/auth/google')
                    next();
                }
                else {
                    const gToken = r.result[0].google_token;
                    resp.status(200).json({message: 'token already created'})
                }
            })
        } catch(err) {
        resp.status(404).json({error: err});
        }
    },
    passport.authorize('google', { scope: ['https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/userinfo.email'] })
    );

    app.post('/upload', upload.single('mypdf'), function (req, resp, next) {
    
        if (!req.user) {
            console.log('USER NOT LOGGED IN');
            resp.redirect('/authenticate')
        }
        getGoogleToken([req.user.username])
        .then(r => {
            console.log('FIND USER TOKEN RESULT', r.result);
            if(r.result[0].google_token == null) {
                resp.redirect('/auth/google')
           }
            else {
                const gToken = r.result[0].google_token;
                console.log('gtoken', gToken);
                const oauth2Client = new google.auth.OAuth2()
                oauth2Client.setCredentials({
                    'access_token': gToken
                });

                const drive = google.drive({
                    version: 'v3',
                    auth: oauth2Client
                });
                console.log('HERE at drive', req.file);
                //move file to google drive
                const driveResponse = drive.files.create({
                    requestBody: {
                        name: req.file.filename,
                        mimeType: req.file.mimetype
                    },
                    media: {
                        mimeType: req.file.mimetype,
                        body: fs.createReadStream(req.file.path)
                    }
                });
                driveResponse.then(data => {

                    if (data.status == 200) resp.redirect('/success.html?file=upload') // success
                    else resp.redirect('/success.html?file=notupload') // unsuccess
        
                }).catch(err => { console.log(err) })
            }
        })
    });

	// LOGOUT ==============================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
    });
    
    app.get('/auth/google',
    passport.authorize('google', { scope: ['https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/userinfo.email'] })
    );
  
    app.get('/auth/google/callback', 
    passport.authorize('google', { failureRedirect: '/' }),
    (req, resp) => {
        resp.redirect('/content.html');
    });
}

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();

	res.redirect('/');
}