const path = require('path');
const express = require('express');
const multer = require('multer');
const upload = multer({ dest: path.join(__dirname, '..', '/uploads') });
const uuid = require('uuid');
const fs = require('fs');

const db = require('../db/dbutil');
const mydb = require('../db/mydbutil');
const sql = require('../db/sqlutil');
const travel = require('../db/travelutil');

module.exports = function(app, conns) {
    
    app.post('/api/journeys', upload.single('journeyImage'),
        mydb.unlinkFileOnResponse(), 
        (req, resp) => {
        const b = req.body;
        let f = null;
        if(req.file) { f = req.file }
        // console.log('BODY: ', b);
        // console.log('FILE: ', f);

        const insertJourney = mydb.mkTransaction(travel.mkJourneys(), conns.mysql);
        insertJourney({body: b, file: f, conns: conns})  
        .then(status => {
            resp.status(201).json({message: `Record ${b.title} inserted`});
        })
        .catch(err => {
            resp.status(500).json({error: err.error});
        });
    });

}
