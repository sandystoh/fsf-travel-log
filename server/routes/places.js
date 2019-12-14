const path = require('path');
const express = require('express');
const multer = require('multer');
const upload = multer({ dest: path.join(__dirname, '..', '/uploads') });
const uuid = require('uuid');
const fs = require('fs');
const { google } = require('googleapis')
const jwt = require('jsonwebtoken');

const db = require('../db/dbutil');
const mydb = require('../db/mydbutil');
const sql = require('../db/sqlutil');
const travel = require('../db/travelutil');

module.exports = function(app, conns) {

    const getPlacesByUser = mydb.mkQuery(`Select p.*, j.title as journey_title from places p
    left join journeys j on p.journey_id = j.id where p.owner = ? and country like ? and p.active = 1
    order by title limit ? offset ? `, conns.mysql)
    
    // Get all Places for particular user (pagination: limit/offset)  (with country filter)
    app.get('/api/places/:user', (req, resp) => {
        const limit = parseInt(req.query.limit) || 12;
        const offset = parseInt(req.query.offset) || 0;
        const country = req.query.country || '%';
        p0 = sql.countWhere(conns.mysql, 'places', `owner = ? and country like ? and active = 1`, [req.params.user, country]);
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

    const getPlaceTitlesByUser = mydb.mkQuery(`Select title from places p where p.owner = ? and active = 1
    order by title`, conns.mysql)
     
    // Get all Places for particular user - names only for autocomplete
    app.get('/api/places/titles/:user', (req, resp) => {
        getPlaceTitlesByUser([req.params.user]).then(r => {
            const titles = r.result.map(v => v.title);
            resp.status(200).json(titles);
         })
         .catch(error => {
             resp.status(500).json({error: "Database Error "+ error.error});
         });
    });

    const getPlacesMapByUser = mydb.mkQuery(`Select id, title, lat, lng, image_url, date, rating from places p
    where owner = ? and active = 1`, conns.mysql)
    const getCountryVisits = mydb.mkQuery(`Select country, count(*) as count from places p where owner = ? and active = 1 group by country`, conns.mysql)
    const getJourneyCount = mydb.mkQuery(`Select count(*) as count from journeys where owner = ? and active = 1`, conns.mysql)

    // Get all Places for particular user for display on map
    app.get('/api/places/map/:user', (req, resp) => {
        const p0 = getPlacesMapByUser([req.params.user]);
        const p1 = getCountryVisits([req.params.user]);
        const p2 = getJourneyCount([req.params.user]);
        Promise.all([p0, p1, p2]).then(r => {
            let j = r[2].result;
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
            resp.status(200).json({visitData, places, placesCount: r[0].result.length, journeyCount: j[0].count ,countryCount: r[1].result.length});
            })
            .catch(error => {
                resp.status(500).json({error: "Database Error "+ error.error});
            });
    });

    const getPlaceById = mydb.mkQuery(`Select p.*, j.title as journey_title, j.num_places as journey_count from places p 
    left join journeys j on p.journey_id = j.id where p.id = ?`, conns.mysql)
    const getPlaceIdByJourneyOrder = mydb.mkQuery(`Select p.id from places p 
      where p.journey_id = ? and p.journey_order = ?`, conns.mysql)
    
    // Get Place by Place ID - Join with Journey to get Journey Data (if applicable otherwise returns null)
    app.get('/api/place/:id', (req, resp) => {
        let place;
        return getPlaceById([req.params.id])
        .then(r => {
            place = JSON.parse(JSON.stringify(r.result[0]));
            place.next_id =0, place.prev_id=0;
            if(place.journey_id !== 0 && place.journey_order < place.journey_count)
                return getPlaceIdByJourneyOrder([place.journey_id, place.journey_order + 1]);
            else return Promise.resolve(false);
        })
        .then(r => {
            if(r && r.result[0]) place.next_id = r.result[0].id;
            if(place.journey_id !== 0 && place.journey_order > 1)
                return getPlaceIdByJourneyOrder([place.journey_id, place.journey_order - 1]);
            else return Promise.resolve(false);
        }).then(r => {
            if(r && r.result[0]) place.prev_id = r.result[0].id;
            mydb.mongoFind({client: conns.mongodb, db: 'travel', collection: 'countries',  find: {code: `${place.country}` } })
            .then(r => {
                place.country_name = r[0].name;
                resp.status(200).json(place);
            }).catch(error => {
                resp.status(500).json({error: "Database Error "+ error});
            });
         })
         .catch(error => {
             resp.status(500).json({error: "Database Error "+ error});
         });
    });

    getId = (param) => {
        let id = 0;
        return getPlaceIdByJourneyOrder(param).then(r => {
            console.log(r.result[0].id);
            id = r.result[0].id;
            return id;
        });
    }

    // Add Place
    app.post('/api/places', upload.single('placeImage'),
        mydb.unlinkFileOnResponse(),  // **** add in token to edit
        (req, resp) => {
        const b = req.body;
        let f = null;
        if(req.file) { f = req.file }
        // console.log('BODY: ', b);
        // console.log('FILE: ', f);

        const insertPlace = mydb.mkTransaction(travel.mkPlaces(), conns.mysql);
        insertPlace({body: b, file: f, conns: conns})  
        .then(status => {
            console.log(status);
            resp.status(201).json({message: `Record ${b.title} inserted`, insertId: status.status});
        })
        .catch(err => {
            resp.status(500).json({error: err.error});
        });
    });
    
    const updatePlace = mydb.mkTransaction(travel.editPlaces(), conns.mysql);

    // Edit Place
    app.post('/api/places/update', upload.single('placeImage'),
        mydb.unlinkFileOnResponse(), 
        (req, resp) => {
        const b = req.body;
        let f = null;
        if(req.file) { f = req.file }

        getPlaceById([req.body.id])
        .then(r => {
            updatePlace({body: b, file: f, conns: conns, old: r.result[0]})  
            .then(status => {
                resp.status(201).json({message: `Record ${b.title} updated`});
            })
            .catch(err => {
                resp.status(500).json({error: err.error});
            });
        });
    });

    // Deactivate Place by Place ID 
    app.delete('/api/place/:id', // **** add token to write private
    (req, resp) => {
        const removePlace = mydb.mkTransaction(travel.rmPlaces(), conns.mysql);
        removePlace({id:req.params.id, conns}).then(r => {
            resp.status(200).json({message: "Delete Successful"});
            })
            .catch(error => {
                resp.status(500).json({error: "Database Error "+ error.error});
            });
    });

    const getGoogleToken = mydb.mkQuery('select google_token from users where username = ?', conns.mysql);
     const getPlaceImage = mydb.s3Get('sandy-fsf-2019', 'places');
    // Save Place Image to Google Drive
    app.get('/api/place/saveimage/:id', 
     (req, resp) => {
        const id = req.params.id;
        const authorization = req.get('Authorization');
        if (!(authorization && authorization.startsWith('Bearer ')))
            return resp.status(403).json({ message: 'not authorized' })
        const tokenStr = authorization.substring('Bearer '.length);
        console.log('tokenStr', tokenStr);
        try {
            var decoded = jwt.verify(tokenStr, conns.secret);
            getGoogleToken([decoded.sub])
            .then(r => {
                if(!r.result[0].google_token) {
                    resp.redirect('/api/auth/google')
                }
                else {
                    let j;
                    const gToken = r.result[0].google_token;       
                    getPlaceById([id]).then(r => {
                        j = r.result[0];
                        return getPlaceImage({s3: conns.s3, filename: r.result[0].image_url})
                    })
                    .then(r => {
                        console.log(r); console.log(gToken);
                        const oauth2Client = new google.auth.OAuth2()
                        oauth2Client.setCredentials({
                            'access_token': gToken
                        });
                        const suffix = (new Date()).getTime();
                        fs.writeFileSync(`temp/${suffix}.jpg`, r.Body);

                        const drive = google.drive({
                            version: 'v3',
                            auth: oauth2Client
                        });
                        //move file to google drive
                        console.log(j.title, r.ContentType);
                        const driveResponse = drive.files.create({
                            requestBody: {
                                name: j.title,
                                mimeType: r.ContentType
                            },
                            media: {
                                mimeType: r.ContentType,
                                body: fs.createReadStream(`temp/${suffix}.jpg`)
                            }
                        });
                        driveResponse.then(data => {
                            console.log('Drive Response', data);
                            fs.unlink(`../temp/${suffix}.jpg`,()=> {});
                            if (data.status == 200) resp.status(200).json({message: "Image Uploaded"}); 
                            else resp.status(500).json({error: "Database Error"});
                        }).catch(err => { resp.status(500).json({error: "Database Error "+ err}); })           
                    })
                    .catch(error => {
                        resp.status(500).json({error: "Database Error "+ error.error});
                    });
                } 
            })
        } catch(err) {
            resp.status(404).send(err);
        }
    });
}
