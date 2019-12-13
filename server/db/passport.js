var LocalStrategy    = require('passport-local').Strategy;
var GoogleStrategy   = require('passport-google-oauth').OAuth2Strategy;
const config = require('./config');

const mydb = require('./mydbutil');

module.exports = function(passport, conns) {
    const FIND_USER = 'select count(*) as user_count from users where username = ? and password = sha2(?, 256)';
    const GET_USER_DETAILS = 'select username, email, display_name, google_id, google_token from users where username = ?';
    const findUser = mydb.mkQuery(FIND_USER, conns.mysql);
    const getUserDetails = mydb.mkQuery(GET_USER_DETAILS, conns.mysql);
    const authenticateUser = (param) => {
        return (
            findUser(param)
                .then(r => (r.result.length && r.result[0].user_count > 0) )
        )
    }

    passport.use(new LocalStrategy(
        {
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true
        },
        // authenticate - callback
        (req, username, pass, done) => {
            console.info(`user: ${username}, pass: ${pass}`);
            authenticateUser([ username, pass ])
                .then(result => {
                    console.info('after authentication: ', result)
                    req.authenticated = result;
                    if (result) {
                        req.loginAt = new Date();
                        // authenticated
                        return done(null, username)
                    }
                    // incorrect username/password
                    done(null, false);
                })
                .catch(error => {
                    console.error('authentication db error: ', error);
                    done(null, false)
                })
        }
    ))

    passport.serializeUser(function(user, done) {
        done(null, user);
    });
    passport.deserializeUser(
        (user, done) => {
            console.info('++ Deserialize user: ', user)
            getUserDetails([ user ])
                .then(r => {
                    console.info('result from deserialize ', r.result)
                    if (r.result.length)
                        return done(null, r.result[0])
                    done(null, user)
                })
    });

    const getUserByGoogleId = mydb.mkQuery('select username, email, display_name, google_id, google_token from users where google_id = ?', conns.mysql);
    const writeGoogleIdToken = mydb.mkQuery('update users set google_id = ? , google_token = ? where username = ?', conns.mysql);

    passport.use(new GoogleStrategy({
        clientID        : config.google.clientId,
        clientSecret    : config.google.clientSecret,
        callbackURL     : 'http://localhost:3000/auth/google/callback',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, accessToken, refreshToken, profile, done) {
        console.log('file', req.file);
        console.log('username', req.user);
        console.log('accesstoken', accessToken);
        console.log('refresh', refreshToken);
        console.log('profile', profile)
        writeGoogleIdToken([profile.id, accessToken, req.user.username])
        .then(() => {
            done(null, req.user.username);
        })

    }));

}