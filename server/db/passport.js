const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const mydb = require('../db/mydbutil');

const initializePassport = function(conns) {
    const FIND_USER = 'select count(*) as user_count from users where username = ? and password = sha2(?, 256)';
    const GET_USER_DETAILS = 'select username, email, display_name from users where username = ?';
    const findUser = mydb.mkQuery(FIND_USER, conns.mysql);
    const getUserDetails = mydb.mkQuery(GET_USER_DETAILS, conns.mysql);

    const authenticateUser = (param) => {
        return (
            findUser(param)
                .then(r => (r.result.length && r.result[0].user_count > 0) )
        )
    }

    passport.use(
        new LocalStrategy(
            {
                usernameField: 'username',
                passwordField: 'password',
            },
            (username, password, done) => {
                authenticateUser([ username, password ])
                    .then(result => {
                        if (result)
                            return (done(null, username))
                        done(null, false);
                    })
            }
        )
    );

    // serialize user 
    // save the user to the session -> create session_id cookie
    passport.serializeUser(
        (user, done) => {
            console.info('** Serialize user: ', user)
            done(null, user);
        }
    )
    // deserialize user 
    // retrieve the user profile from database and pass it to passport
    // passport will attach the user details to req.user
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
        }
    )

    return passport;
}

module.exports = { initializePassport }