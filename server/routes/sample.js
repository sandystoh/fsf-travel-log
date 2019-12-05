const path = require('path');
const express = require('express');
const multer = require('multer');
const upload = multer({ dest: path.join(__dirname, '..', '/uploads') });
const uuid = require('uuid');
const fs = require('fs');

const db = require('../db/dbutil');
const mydb = require('../db/mydbutil');
const sql = require('../db/sqlutil');
const article = require('../db/articleutil');

module.exports = function(app, conns) {
    const ROUTE_URL = '/api/sample';

    // Sample Get from MySQL
    // http://localhost:3000/api/sample/mysql
    app.get(`${ROUTE_URL}/mysql`, (req, resp) => {
        sql.select(conns.mysql, 'articles')
        .then(status => {
            resp.status(200).json({sample: status.result});
        })
        .catch(err => {
            resp.status(500).json({error: err});
        });
    })
    
    // Sample Get with ID from MySQL
    // http://localhost:3000/api/sample/mysql/772dc17e
    app.get(`${ROUTE_URL}/mysql/:id`, (req, resp) => {
        const id = req.params.id; // use parseInt(req.params.id) for auto increment
        sql.selectWhere(conns.mysql, 'articles', 'art_id = ?', [id, 1, 0])
        .then(status => {
            if (!status.result.length) resp.status(404).json({message: `ID ${id} not found`});
            resp.status(200).json({sample: status.result});
        })
        .catch(err => {
            resp.status(500).json({error: err.error});
        });
    })

    // Sample Get with Search from MySQL
    // http://localhost:3000/api/sample/search?q=heroku
    app.get(`${ROUTE_URL}/search`, (req, resp) => {
        const q = `%${req.query.q}%`;
        const limit = parseInt(req.query.limit) || 2;
        const offset = parseInt(req.query.offset) || 0;
        p0 = sql.selectWhere(conns.mysql, 'articles', 'title like ?', [q, limit, offset]);
        p1 = sql.countWhere(conns.mysql, 'articles', 'title like ?', [q]);
        Promise.all([p0, p1])
        .then(status => {
            if (!status[0].result.length) resp.status(404).json({message: `Search term ${req.query.q} not found`});
            resp.status(200).json({sample: status[0].result, count: status[1].result[0].count});
        })
        .catch(err => {
            resp.status(500).json({error: err.error});
        });
    });

    // Sample Get from Mongo
    // http://localhost:3000/api/sample/mongo
    app.get(`${ROUTE_URL}/mongo`, (req, resp) => {
        // m = mongo object = {client, db, collection, find, skip, limit, sort, project, count}
        mydb.mongoFind({client: conns.mongodb, db: 'myfb', collection: 'posts', limit: 10})
        .then(result => {
            resp.status(200).json({sample: result});
        })
        .catch(err => {
            resp.status(500).json({error: err});
        });
    });

    // Sample Get + Search from Mongo
    // http://localhost:3000/api/sample/mongo/search?q=post&limit=5&offset=2
    app.get(`${ROUTE_URL}/mongo/search`, (req, resp) => {
        const q = new RegExp(req.query.q, "i");
        const limit = parseInt(req.query.limit) || 2;
        const offset = parseInt(req.query.offset) || 0;
        p0 = mydb.mongoFind({client: conns.mongodb, db: 'myfb', collection: 'posts', find: {title: q} ,limit, offset})
        p1 = mydb.mongoCount({client: conns.mongodb, db: 'myfb', collection: 'posts', find: {title: q}})
        Promise.all([p0, p1])
        .then(status => {
            if (!status[0].length) resp.status(404).json({message: `Search term ${req.query.q} not found`});
            resp.status(200).json({sample: status[0], count: status[1]});
        })
        .catch(err => {
            resp.status(500).json({error: err.error});
        });
    });

    // Sample Get from MongoDB with Aggregate
    // http://localhost:3000/api/sample/mongo/aggregate/fred@gmail.com
    app.get(`${ROUTE_URL}/mongo/aggregate/:email`, (req, resp) => {
        const email = req.params.email
        const aggregate = [
            { $match: { "email": `${email}` } },
            { $limit: 5 },
            { $project: {_id: 1, email: 1, comment: 1} }
        ];
        mydb.mongoAggregate({client: conns.mongodb, db: 'myfb', collection: 'posts', aggregate  })
        .then(r => {
            resp.status(200).json(r.map(v =>{
                return {
                    post_id: v.id,
                    email: v.email,
                    comment: v.comment
                }
            }));
        })
        .catch(err => {
            resp.status(500).json({error: err});
        });
    });

    const article_columns = "art_id, title, email, article, image_url, posted";
    // Sample Post - Single Table insert to MySQL
    // http://localhost:3000/api/sample/mysql   image_url: 18eace4a895eaadb8583415fd7a81405
    app.post(`${ROUTE_URL}/mysql`, express.json(), (req, resp) => {
        const b = req.body;
        console.log(b);
        
        const params = [uuid().substring(0,8), b.title, b.email, b.article, b.image_url, new Date()];
        sql.insert(conns.mysql, 'articles', article_columns, params)
        .then(status => {
            resp.status(201).json({message: `Record ${b.title} inserted`});
        })
        .catch(err => {
            resp.status(500).json({error: err.error});
        });
    });

    // Sample Post - Single Record insert to Mongo
    // http://localhost:3000/api/sample/mongo  
    app.post(`${ROUTE_URL}/mongo`, express.json(), 
        mydb.logRequestsToMongo('logs', 'test', conns.mongodb),
        (req, resp) => {
        const b = req.body;
        const mongo = {db: 'myfb', collection: 'posts', client: conns.mongodb};
        mongo.document = {id: uuid().substring(0,8), title: b.title, email: b.email, article: b.article, posted: new Date()};
        mydb.mongoWrite(mongo)
        .then(status => {
            resp.status(201).json({message: `Record ${b.title} inserted`});
        })
        .catch(err => {
            resp.status(500).json({error: err.error});
        });
    });

    // Sample Post - Multiple Record insert to Mongo
    // http://localhost:3000/api/sample/mongomulti 
    app.post(`${ROUTE_URL}/mongomulti`, express.json(), 
        mydb.logRequestsToMongo('logs', 'test', conns.mongodb),
        (req, resp) => {
        const b = req.body;
        const mongo = {db: 'myfb', collection: 'posts', client: conns.mongodb};
        mongo.documents = [];
        mongo.documents.push({id: uuid().substring(0,8), title: b.title, email: b.email, article: b.article, posted: new Date()});
        mongo.documents.push({id: uuid().substring(0,8), title: b.title, email: b.email, article: b.article, posted: new Date()});
        mydb.mongoWriteMany(mongo)
        .then(status => {
            resp.status(201).json({message: `Records ${b.title} inserted`});
        })
        .catch(err => {
            resp.status(500).json({error: err.error});
        });
    });

    // Sample Post - Transactional Multi Table insert to MySQL
    // http://localhost:3000/api/sample/multisql   image_url: 18eace4a895eaadb8583415fd7a81405
    app.post(`${ROUTE_URL}/multisql`, express.json(), (req, resp) => {
        const b = req.body;
        const insertArticle = mydb.mkTransaction(article.mkArticle(), conns.mysql);
        insertArticle({body: b})
        .then((r) => {
            resp.status(201).json({message: `Record ${b.title} inserted`});
        })
        .catch(err => {
            resp.status(500).json({error: err.error});
        });
    })

    // Sample Post - Transactional Multi Table insert to MySQL/S3
    // http://localhost:3000/api/sample/sqls3 
    app.post(`${ROUTE_URL}/sqls3`, upload.single('artImage'), 
        (req, resp, next) => {
            resp.on('finish',
                () => {
                    fs.unlink(req.file.path, () => { });
                }
            )
            const uploader = req.body.email;
            if (!uploader)
                return resp.status(400).type('text/html')
                    .send('<h2>Missing uploader email</h2>');
            sql.selectWhere(conns.mysql, 'users', 'email = ?', [uploader, 1, 0])
                .then(r => {
                    if (r.result.length)
                        return next();
                    resp.status(403).type('text/html')
                        .send(`<h2><code>${uploader}</code> cannot post news articles</h2>`);
                })
                .catch(error => {
                    resp.status(500).type('text/html')
                        .send(`<h2>Error: ${error.error}</h2>`);
                });
        },
        (req, resp) => {
        const b = req.body;
        const f = req.file;
        const insertArticle = mydb.mkTransaction(article.mkArticleWithS3(), conns.mysql);
        insertArticle({body: b, file: f, conns: conns})  // remember to pass in conns
        .then((r) => {
            resp.status(201).json({message: `Record ${b.title} inserted`});
        })
        .catch(err => {
            resp.status(500).json({error: err.error});
        });
    })

    // Sample Post - Transactional Multi Table insert to MySQL/S3/MOngoDB
    // http://localhost:3000/api/sample/sqls3mongo
    app.post(`${ROUTE_URL}/sqls3mongo`, upload.single('artImage'), 
        mydb.unlinkFileOnResponse(), article.authenticateUser(conns.mysql),
        mydb.logRequestsToMongo('logs', 'test', conns.mongodb),
        (req, resp) => {
        const b = req.body;
        const f = req.file;
        const insertArticle = mydb.mkTransaction(article.mkArticleWithMongo(), conns.mysql);
        insertArticle({body: b, file: f, conns: conns})  // remember to pass in conns
        .then((r) => {
            if (r.insertedCount < 1 ) resp.status(403).json({message: `Error Creating Post in Mongo DB`});
            return resp.status(201).json({message: `Record ${b.title} inserted`});
            // return resp.status(200).redirect('/list');
        })
        .catch(err => {
            resp.status(500).json({message: `Error Occurred in upload of ${b.title}. Please try again!`, error: err.error});
        });
    });

    // WIP - Multiple File Upload
    app.post('/api/uploadmulti', fileUpload.array('photos', 12), (req,resp) => {
        console.log(req.files);
        resp.status(200).json({message: 'good'});
    })
}
