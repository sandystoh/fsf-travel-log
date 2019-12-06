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

    const getJourneysByUser = mydb.mkQuery(`select * from journeys where owner = ? and id in (
        select distinct(journey_id) from places where owner = ? and country like ?) limit ? offset ?`, conns.mysql)
    const countJourneysByUser = mydb.mkQuery(`select count(*) as count from journeys where owner = ? and id in (
        select distinct(journey_id) from places where owner = ? and country like ?)`, conns.mysql)

    // Get all Journeys for particular user (pagination: limit/offset) (with country filter)
    app.get('/api/journeys/:user', (req, resp) => {
        const user = req.params.user;
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        const country = req.query.country || '%';
        p0 = countJourneysByUser([user, user, country] );
        p1 = getJourneysByUser([user, user, country, limit, offset] );

        Promise.all([p0, p1]).then(r => {
            console.log(r);
            const count = r[0].result[0].count;
            resp.status(200).json({journeys: r[1].result, count}); 
            // returns empty array + count 0 if none, handled by client
         })
         .catch(error => {
             resp.status(500).json({error: "Database Error "+ error.error});
         });
    });

    const getJourneyById = mydb.mkQuery(`Select * from journeys where id = ?`, conns.mysql);
    const getPlacesByJourneyId = mydb.mkQuery(`Select * from places where journey_id = ? and active = 1`, conns.mysql);
    
    // Get Journey by Journey ID - One to Many Places (Get all Child Places)
    app.get('/api/journey/:id', (req, resp) => {
        const id = req.params.id;
        const alpha = 'ABCDEFGHIJKLMNOPQSTUVWXYZ';
        p0 = getJourneyById([id]);
        p1 = getPlacesByJourneyId([id]);
        Promise.all([p0, p1]).then(r => {
            const places = r[1].result.map(v => {
                return {
                    ...v,
                    alpha: alpha[(v.journey_order-1) % 26]
                }
            });
            resp.status(200).json({journey: r[0].result, places})
        })
        .catch(err => {
            resp.status(500).json({error: "Database Error "+ error});
        });
    });

    // Add Journey
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

    // Deactivate Journey by Journey ID 
    // http://localhost:3000/api/journey/1?remove_child=true -- need to state whether to remove children
    app.delete('/api/journey/:id', // **** add token to write private
    (req, resp) => {
        const removeJourney = mydb.mkTransaction(travel.rmJourneys(), conns.mysql);
        removeJourney({id:req.params.id, remove_child: req.query.remove_child, conns}).then(r => {
            resp.status(200).json({message: "Delete Successful"});
            })
            .catch(error => {
                resp.status(500).json({error: "Database Error "+ error.error});
            });
    });
}
