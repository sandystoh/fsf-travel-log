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

    // Gets List of Countries for Option List
    app.get('/api/countries', (req, resp) => {
        // m = mongo object = {client, db, collection, find, skip, limit, sort, project, count}
        mydb.mongoFind({client: conns.mongodb, db: 'travel', collection: 'countries'})
        .then(result => {
            const countries = result.map(v => {
                return { name: v.name, code: v.code2l }
            })
            resp.status(200).json(countries);
        })
        .catch(err => {
            resp.status(500).json({error: err});
        });
    });

    const searchByUser = mydb.mkQuery(`Select p.*, j.title as journey_title from places p
    left join journeys j on p.journey_id = j.id where 
    p.owner = ? and (p.title like ? or j.title like ?) and p.country like ? order by title
    limit ? offset ?`, conns.mysql)
    const countSearch = mydb.mkQuery(`Select count(*) as count from places p
    left join journeys j on p.journey_id = j.id 
    where p.owner = ? and (p.title like ? or j.title like ?) and p.country like ?`, conns.mysql)
    
    // Search within a User's Journeys/Places for query string within titles (with country filter)
    app.get('/api/places/search/:user', (req, resp) => {
        const limit = parseInt(req.query.limit) || 12;
        const offset = parseInt(req.query.offset) || 0;
        // matches exact string if country is provided, otherwise matches all countries
        const country = req.query.country || '%'; 
        let q = '';
        if (req.query.q) q = `%${req.query.q}%`;
        else resp.status(404).json({error: "Invalid Request"});
        
        p0 = countSearch([req.params.user, q, q, country])
        p1 = searchByUser([req.params.user, q, q, country,limit, offset]);
        
        Promise.all([p0, p1]).then(r => {
            const count = r[0].result[0].count;
            resp.status(200).json({places: r[1].result, count}); 
            // returns empty array + count 0 if none, handled by client
         })
         .catch(error => {
             resp.status(500).json({error: "Database Error "+ error.error});
         });
    }); 
}