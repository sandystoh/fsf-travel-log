const express = require('express');
const mydb = require('../db/mydbutil');
const sql = require('../db/sqlutil');
const fs = require('fs');
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });
const { google } = require('googleapis');
const jwt = require('jsonwebtoken');

module.exports = function(app, passport, conns) {

    const GET_USER_DETAILS = 'select username, email, display_name from users where username = ?';
    const getUserDetails = mydb.mkQuery(GET_USER_DETAILS, conns.mysql);

    app.post('/api/authenticate', 
    passport.authenticate('local', {
        failureRedirect: '/error.html'
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
            .catch(e => {
                console.log(e);
                resp.status(500).json({error: 'Database Error '+e});
            });
    });

    const ADD_USER = `insert into users (username, password, email, display_name) 
            values (? , SHA2(?, 256), ?, ?)`
    const createUser = mydb.mkQuery(ADD_USER, conns.mysql);
    app.post('/api/signup', express.json(),
    (req, resp) => {
        console.log(req.body.signup);
        const u = req.body.signup;
        createUser([u.username, u.password, u.email, u.display_name])
            .then(r => {
                const d = new Date()
                const token = jwt.sign({
                    sub: u.username,
                    iss: 'fsf-travel-app',
                    iat: d.getTime()/1000,
                    exp: (d.getTime()/1000) + (60 * 60)
                }, conns.secret);
                req.session.token = token;
                resp.format({
                    'text/html': () => {
                        resp.redirect('/');
                    },
                    'application/json': () => {
                        return resp.status(200).json({
                            token_type: 'Bearer',
                            access_token: token,
                            username: u.username,
                            display_name: u.display_name
                        })
                    },
                    'default': () => {
                        resp.redirect('/')
                    }
                })
            })
            .catch(e => {
                console.log(e);
                resp.status(500).json({error: 'Database Error '+e});
            });
    });

    
    const getGoogleToken = mydb.mkQuery('select google_token from users where username = ?', conns.mysql);
    app.get('/api/link/google',  
     (req, resp) => {
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
                resp.redirect('/api/auth/google')
            }
            else {
                const gToken = r.result[0].google_token;
                resp.status(200).json({message: 'token already created'})
            }
            })
        } catch(err) {
            console.log(err);
            resp.status(302).redirect('/');
            //   resp.status(404).json({error: err});
        } 
    });
    
    app.get('/api/auth/google',
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