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

    const getPlacesByUser = mydb.mkQuery(`Select p.*, j.title as journey_title from places p
    left join journeys j on p.journey_id = j.id where p.owner = ? and country like ? limit ? offset ? `, conns.mysql)
    
    // Get all Places for particular user (pagination: limit/offset)  (with country filter)
    app.get('/api/places/:user', (req, resp) => {
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        const country = req.query.country || '%';
        p0 = sql.countWhere(conns.mysql, 'places', `owner = ? and country like ?`, [req.params.user, country]);
        p1 = getPlacesByUser([req.params.user, country, limit, offset]);
        
        Promise.all([p0, p1]).then(r => {
            const count = r[0].result[0].count;
            resp.status(200).json({places: r[1].result, count}); 
            // returns empty array + count 0 if none, handled by client
         })
         .catch(error => {
             resp.status(500).json({error: "Database Error "+ error.error});
         });
    });

    const getPlacesMapByUser = mydb.mkQuery(`Select id, title, lat, lng, image_url, date, rating from places p
    where owner = ?`, conns.mysql)
    const getCountryVisits = mydb.mkQuery(`Select country, count(*) as count from places p where owner = ? group by country`, conns.mysql)
    
    // Get all Places for particular user for display on map
    app.get('/api/places/map/:user', (req, resp) => {
        const p0 = getPlacesMapByUser([req.params.user]);
        const p1 = getCountryVisits([req.params.user])
        Promise.all([p0, p1]).then(r => {
            console.log(r[1]);
            const visitData = {}
            
            r[1].result.map(v => {
                visitData[v.country] = v.count
            });
            const places = r[0].result.map(v => {
                return {
                    id: v.id,
                    latLng: [v.lat, v.lng],
                    name: v.title,
                    image_url: v.image_url,
                    date: v.date,
                    rating: v.rating
                }
            });
            resp.status(200).json({visitData, places});
            })
            .catch(error => {
                resp.status(500).json({error: "Database Error "+ error.error});
            });
    });

    const getPlaceById = mydb.mkQuery(`Select p.*, j.title as journey_title, j.num_places as journey_count from places p 
    left join journeys j on p.journey_id = j.id where p.id = ?`, conns.mysql)
    
    // Get Place by Place ID - Join with Journey to get Journey Data (if applicable otherwise returns null)
    app.get('/api/place/:id', // add token to read private
    (req, resp) => {
        return getPlaceById([req.params.id]).then(r => {
            resp.status(200).json({place: r.result[0]});
         })
         .catch(error => {
             resp.status(500).json({error: "Database Error "+ error});
         });
    });

    // Add Place
    app.post('/api/places', upload.single('placeImage'),
        mydb.unlinkFileOnResponse(),  // add in token to edit
        (req, resp) => {
        const b = req.body;
        let f = null;
        if(req.file) { f = req.file }
        // console.log('BODY: ', b);
        // console.log('FILE: ', f);

        const insertPlace = mydb.mkTransaction(travel.mkPlaces(), conns.mysql);
        insertPlace({body: b, file: f, conns: conns})  
        .then(status => {
            resp.status(201).json({message: `Record ${b.title} inserted`});
        })
        .catch(err => {
            resp.status(500).json({error: err.error});
        });
    });

}
