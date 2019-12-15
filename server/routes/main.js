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
                return { name: v.name, code: v.code, continent: v.continent }
            })
            // Content Negotiation
            resp.format({
                'text/html': () => {
                    let countryStr = `<h1>List of Countries</h1><ul>`;
                    for (let c of countries) {
                        countryStr += `<li>${c.name} (${c.code})</li>`
                    }
                    countryStr += '</ul>'
                    resp.status(200).type('text/html').send(countryStr);
                },
                'application/json': () => {
                    resp.status(200).json(countries);
                },
                'default': () => {
                    resp.status(200).json(countries);
                }
            });
        })
        .catch(err => {
            resp.status(500).json({error: err});
        });
    });

    // Checks if username taken
    const checkExistsByUsername = mydb.mkQuery(`Select count(*) as count from users where username = ?`, conns.mysql)
    app.get('/api/checkuser/:username', (req, resp) => {
        const username = req.params.username;
        checkExistsByUsername([username])
        .then(r => {
            console.log(r.result)
            if(r.result[0].count) 
                resp.status(200).json({available: false});
            resp.status(200).json({available: true});
        })
        .catch(err => {
            resp.status(500).json({error: err});
        });
    })

    
    // Accepts Donations
    app.get('/api/donate', (req, resp) => {
        const token = req.body.token
        console.log(token);
        mydb.mongoWrite({client: conns.mongodb, db: 'travel', collection: 'payments', document: token})
        .then(result => {
            console.log(result);
            resp.status(200).json(countries);
        })
        .catch(err => {
            resp.status(500).json({error: err});
        });
    });

    const searchJourneysByUser = mydb.mkQuery(`Select * from journeys j where 
    owner = ? and title like ? and type = ? order by title limit ? offset ?`, conns.mysql)
    const countJourneySearch = mydb.mkQuery(`Select count(*) as count from journeys j where 
    owner = ? and title like ? and type = ? order by title`, conns.mysql)
    
    // Search within a User's Journeys/Places for query string within titles (with country filter)
    app.get('/api/journeys/search/:user', (req, resp) => {
        const limit = parseInt(req.query.limit) || 12;
        const offset = parseInt(req.query.offset) || 0;
        const type = req.query.type || 'BEEN';
        // matches exact string if country is provided, otherwise matches all countries
        const country = req.query.country || '%'; 
        let q = '';
        if (req.query.q) q = `%${req.query.q}%`;
        else resp.status(404).json({error: "Invalid Request"});
        
        p0 = countJourneySearch([req.params.user, type, q])
        p1 = searchJourneysByUser([req.params.user, q, type, limit, offset]);
        
        Promise.all([p0, p1]).then(r => {
            const count = r[0].result[0].count;
            resp.status(200).json({journeys: r[1].result, count}); 
            // returns empty array + count 0 if none, handled by client
         })
         .catch(error => {
             resp.status(500).json({error: "Database Error "+ error.error});
         });
    }); 

    const searchByUser = mydb.mkQuery(`Select p.*, j.title as journey_title from places p
    left join journeys j on p.journey_id = j.id where 
    p.owner = ? and (p.title like ? or j.title like ?) and p.country like ? and p.type = ?  order by title
    limit ? offset ?`, conns.mysql)
    const countSearch = mydb.mkQuery(`Select count(*) as count from places p
    left join journeys j on p.journey_id = j.id 
    where p.owner = ? and (p.title like ? or j.title like ?) and p.country like ? and p.type = ?`, conns.mysql)
    
    // Search within a User's Journeys/Places for query string within titles (with country filter)
    app.get('/api/places/search/:user', (req, resp) => {
        const limit = parseInt(req.query.limit) || 12;
        const offset = parseInt(req.query.offset) || 0;
        const type = req.query.type || 'BEEN';
        console.log(type)
        // matches exact string if country is provided, otherwise matches all countries
        const country = req.query.country || '%'; 
        let q = '';
        if (req.query.q) q = `%${req.query.q}%`;
        else resp.status(404).json({error: "Invalid Request"});
        
        p0 = countSearch([req.params.user, q, q, country, type])
        p1 = searchByUser([req.params.user, q, q, country, type, limit, offset]);
        
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