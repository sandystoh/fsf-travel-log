const path = require('path');
const express = require('express');
const multer = require('multer');
const uuid = require('uuid');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const db = require('../db/dbutil');
const mydb = require('../db/mydbutil');
const sql = require('../db/sqlutil');
const travel = require('../db/travelutil');

module.exports = function(app, conns, passport) {

    const GET_USER_DETAILS = 'select username, email, display_name from users where username = ?';
    const getUserDetails = mydb.mkQuery(GET_USER_DETAILS, conns.mysql);

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
                    exp: (d.getTime()/1000) + (60 * 60),
                    data: {
                        email: rec.email,
                        display_name: rec.display_name
                    }
                }, conns.secret);
                req.session.token = token;
                resp.format({
                    'text/html': () => {
                        resp.redirect(`/client?access_token=${req.session.token}`)
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
                        resp.redirect(`/client?access_token=${req.session.token}`)
                    }
                })
            }) 
    }
)

}