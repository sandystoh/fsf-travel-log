const mydb = require('../db/mydbutil');
const sql = require('../db/sqlutil');
const uuid = require('uuid');

// Transaction with Article + Article Details (MySQL)
    const insertArticle = mydb.trQuery('insert into articles(art_id, title, email, article, image_url, posted) values(?,?,?,?,?,?)');
    const insertComments = mydb.trQuery('insert into article_comments(art_id,email, comment, posted) values ?');
    function mkArticle() {
        return (status) => {
          const b = status.body;
          const connection = status.connection;
          const newId = uuid().substring(0,8);
          const params = [newId, b.title, b.email, b.article, b.image_url, new Date()];
          return insertArticle({connection, params}).then((r) => {
              console.log('insertId: ', r.result.insertId);
              const paramsArray = b.articleComments.map(v => {
                  return v = [newId, v.email, v.comment, new Date()];
              });
              return insertComments({connection, params: [paramsArray]})
          });
      }
    }

const uploadArticleImageToS3 = mydb.s3Upload('sandy-paf-2019', 'art');

// Transaction with Article (MySQL) + Image (S3)
    function mkArticleWithS3() {
        return (status) => {
            const b = status.body;
            const f = status.file;
            const conn = status.connection;
            return insertArticle({params: [ uuid().substring(0,8), b.title, b.email, b.article, f.filename, new Date() ], connection:conn})
            .then(s => {
                s.file = f;
                s.s3 = status.conns.s3;
                return uploadArticleImageToS3(s);
            });
        }
    }

    // Transaction with Article (MySQL) + Image (S3) + Write to Mongo
    function mkArticleWithMongo() {
        return (status) => {
            const b = status.body;
            const f = status.file;
            const conn = status.connection;
            const conns = status.conns;
            // Write to MySQL
            return insertArticle({params: [ uuid().substring(0,8), b.title, b.email, b.article, f.filename, new Date() ], connection:conn})
            .then(s => {
                s.file = f;
                s.s3 = conns.s3;
                // Write to S3
                return uploadArticleImageToS3(s);
                // return mydb.s3Upload(s);
            })
            .then(() => {
                const mongo = {db: 'myfb', collection: 'posts'};
                mongo.client = conns.mongodb;
                mongo.document = {id: uuid().substring(0,8), title: b.title, email: b.email, article: b.comment, image: f.filename, posted: new Date()};
                // Write to Mongo
                return mydb.mongoWrite(mongo);
            });
        }
    }
    
    // Middleware that authenticates User from MySQL
    const authenticateUser = (conn) => {
        return (req,resp,next)=>{
            const auth = req.body.email;
            if (!auth)
                return resp.status(400).type('text/html')
                    .send('<h2>Missing email</h2>');
            
            authUser = mydb.mkQuery('select * from users where email = ?', conn);
            authUser([auth])
                .then(r => {
                    if (r.result.length)
                        return next();
                    resp.status(403).type('text/html')
                        .send(`<h2><code>${auth}</code> is not Authorized!</h2>`);
                })
                .catch(error => {
                    resp.status(500).type('text/html')
                        .send(`<h2>Error: ${error.error}</h2>`);
                }); 
        };
    }

    module.exports = { mkArticle, mkArticleWithS3, mkArticleWithMongo, authenticateUser };