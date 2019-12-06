const fs = require('fs');
const path = require('path');

// MySQL Utils
// Creates Transaction and Rollsback/Commits
const mkTransaction = function(transaction, pool) {
    return status => {
        return new Promise((resolve, reject) => {
            pool.getConnection((err,conn) => {
                if (err) 
                    return reject({error: err});

                conn.beginTransaction(err => {
                    if (err) {
                        console.error(err);
                        conn.rollback(() => conn.release()); 
                        return reject({error: err, connection: conn});
                    } 
                    status.connection = conn;
                    transaction(status)
                    .then(()=> {
                        conn.commit((err,result) => {
                            conn.release();
                            if (err) {
                                console.error(err);
                                conn.rollback(() => conn.release()); 
                                return reject({error: err, connection: conn});
                            }
                            resolve({result, connection: conn});
                        });
                    }).catch(status => {
                        console.error('Rollback: ' + status.error);
                        conn.rollback(() => conn.release());
                        return reject({error: status.error, connection: status.connection});
                    });
                });
            });
        });
    }
} 

// MySQL Transaction Query without releasing
const trQuery = function (sql) {
    return (status) => {
        conn = status.connection;
        return new Promise((resolve, reject) => {
                conn.query(sql, status.params || [], (err, result) => {
                    if(err) {
                        return reject({error: err, connection: status.connection});
                    }
                    resolve({result, connection: status.connection});
                });
        });
    }
}

// MySQL Query
const mkQuery = function (sql, pool) {
    return (params) => {
        return new Promise((resolve, reject) => {
            pool.getConnection((err,conn) => {
                if (err) 
                    return reject({error: err, connection: conn});
                conn.query(sql, params || [], (err, result) => {
                    conn.release();
                    if(err) 
                        return reject({error: err, connection: conn});
                    resolve({result, connection: conn});
                });
            });
        })
    }
}

// S3 Download
const s3Get = function(s3Bucket, s3Folder) {
    return status => {
        // status = { conns.s3, filename }
        return new Promise((resolve, reject) => {
            const params = { 
                Bucket: s3Bucket, 
                Key: `${s3Folder}/${status.filename}`
            };
            (status.s3).getObject(params, (error, result) => { 
                if(error) {
                    console.log(error);
                    return reject(error);
                }
                resolve(result);
            });
        });
    }
}

// S3 Upload
const s3Upload = function(s3Bucket, s3Folder) {
    return status => {
        // status = { file, filepath, s3: conns.s3 }
        return new Promise((resolve, reject) => {
            if(status.file === undefined) {
                return reject({error: 'File not Found'});
            }   
            const file = status.file;
            let metadata = {};
            if(status.metadata) metadata = status.metadata;

            fs.readFile(file.path, (err, imgFile) => {
                if (err) {
                    console.log(err);
                    return reject({error: err});
                }
                const params = { 
                    Bucket: s3Bucket, 
                    Key: `${s3Folder}/${status.filepath}`, 
                    Body: imgFile, ContentType: file.mimetype,
                    ContentLength: file.size, ACL: 'public-read',
                    Metadata: metadata
                }; 
                (status.s3).putObject(params, (error, result) => { 
                    if(error) {
                        console.log(error);
                        return reject(error);
                    }
                    resolve();
                });
            });
        })
    }
}

// Mongo Insert One
const mongoWrite = (m) => {
    // m = {client, db, collection, document}
    const collection = m.client.db(m.db).collection(m.collection);
    return collection.insertOne(m.document);
}

// Mongo Insert Many
const mongoWriteMany = (m) => {
    // m = {client, db, collection, documents = [{<document>}, {<document>}]}
    const collection = m.client.db(m.db).collection(m.collection);
    return collection.insertMany(m.documents);
}

// Mongo Find
const mongoFind = (m) => {
	// m = mongo object = {client, db, collection, find, skip, limit, sort, project}
    const collection = m.client.db(m.db).collection(m.collection);
    console.log(m);
	return collection.find(m.find || {}).sort(m.sort || {}).skip(m.offset || 0).limit(m.limit || 0).project(m.project || {}).toArray();
}

// Mongo Count
const mongoCount = (m) => {
	// m = mongo object = {client, db, collection, find, skip, limit, sort, project}
    const collection = m.client.db(m.db).collection(m.collection);
    console.log(m);
	return collection.find(m.find || {}).count();
}

// Mongo Find Array of distinct values
const mongoDistinct = (m) => {
    return new Promise((resolve, reject) => {
        const collection = m.client.db(m.db).collection(m.collection);
        collection.distinct(m.field)
        .then((result) => {
            resolve(result);
        })
        .catch((err) => {
            reject(err);
        })

    })
}

// Mongo Aggregate
const mongoAggregate = (m) => {
	// m = mongo object = {client, db, collection, aggregate}
    // console.log(m);
    const collection = m.client.db(m.db).collection(m.collection);
	return collection.aggregate(m.aggregate).toArray();
}

// Middleware that writes request processing time to logs
const logRequestsToMongo = (db, collection, client) => {
	return (req,resp,next)=>{
        const start = (new Date()).getTime();
        resp.on('finish', () => {
            const end = (new Date()).getTime();
            const document = {
                method: req.method,
                url: req.originalUrl,
                ip: req.ip,
                'user-agent': req.get('User-Agent'),
                'process-time': (end - start), // .toLocaleString('en-US', {minimumFractionDigits: 3})} s
                status: resp.statusCode
            }
            mongoWrite({client, db, collection, document});
        });
        next();
	};
}

// Middleware that unlinks File when Response Sent
const unlinkFileOnResponse = () => {
	return (req,resp,next)=>{
		resp.on('finish',()=>{
            if(!!req.file)
			    fs.unlink(req.file.path,()=>{ });
		});
		next();
	};
}

module.exports = { 
    mkTransaction, trQuery, mkQuery, // MySQL
    s3Upload, s3Get, // Digital Ocean S3
    mongoWrite, mongoWriteMany, mongoFind, mongoCount, mongoDistinct, mongoAggregate, // mongoDB
    logRequestsToMongo, unlinkFileOnResponse    // Utility Middleware
};