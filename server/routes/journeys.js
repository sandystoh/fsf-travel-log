const path = require('path');
const express = require('express');
const multer = require('multer');
const upload = multer({ dest: path.join(__dirname, '..', '/uploads') });
const uuid = require('uuid');
const fs = require('fs');
const moment = require('moment');
const request = require('request-promise');

const db = require('../db/dbutil');
const mydb = require('../db/mydbutil');
const sql = require('../db/sqlutil');
const travel = require('../db/travelutil');

module.exports = function(app, conns) {

    const getJourneysByUser = mydb.mkQuery(`select * from journeys where owner = ? limit ? offset ?`, conns.mysql)
    const countJourneysByUser = mydb.mkQuery(`select count(*) as count from journeys where owner = ?`, conns.mysql)

    const getJourneysByUserCountry = mydb.mkQuery(`select * from journeys where owner = ? and id in (
        select distinct(journey_id) from places where owner = ? and country like ?) limit ? offset ?`, conns.mysql)
    const countJourneysByUserCountry = mydb.mkQuery(`select count(*) as count from journeys where owner = ? and id in (
        select distinct(journey_id) from places where owner = ? and country like ?)`, conns.mysql)

    // Get all Journeys for particular user (pagination: limit/offset) (with country filter)
    app.get('/api/journeys/:user', (req, resp) => {
        const user = req.params.user;
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        const country = req.query.country || '%';
        p0 = countJourneysByUser([user] );
        p1 = getJourneysByUser([user, limit, offset] );
        //p0 = countJourneysByUserCountry([user, user, country] );
        //p1 = getJourneysByUserCountry([user, user, country, limit, offset] );

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

    const getJourneySummaryByUser = mydb.mkQuery(`select id, title, date, num_places from journeys 
    where owner = ? and type = ? and active = 1 order by title`, conns.mysql)

    // Get all Journeys for particular user (pagination: limit/offset) (with country filter)
    app.get('/api/journeys/list/:user', (req, resp) => {
        const user = req.params.user;
        const type = req.query.type;
        getJourneySummaryByUser([user, type] ).then(r => {
            resp.status(200).json(r.result);
         })
         .catch(error => {
             resp.status(500).json({error: "Database Error "+ error.error});
         });
    });

    const getJourneyById = mydb.mkQuery(`Select * from journeys where id = ?`, conns.mysql);
    const getPlacesByJourneyId = mydb.mkQuery(`Select * from places where journey_id = ? and active = 1 order by journey_order`, conns.mysql);
    
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
            resp.status(200).json({journey: r[0].result[0], places})
        })
        .catch(error => {
            resp.status(500).json({error: "Database Error "+ error});
        });
    });

    const checkNeedToRefresh = mydb.mkQuery(`Select refresh_map as refresh from journeys where id = ?`, conns.mysql);
    const checkMapAvailable = mydb.s3CheckExists('sandy-fsf-2019', 'journeys/maps');
    const uploadMapToS3 = mydb.s3UploadRawFile('sandy-fsf-2019', 'journeys/maps');

    // Get Journey Map from Google Maps or S3
    app.get('/api/journey/map/:id',
        (req, resp, next) => {
            const id = req.params.id;
            checkNeedToRefresh([id])
            .then(r => { 
                const refresh = r.result[0].refresh;
                // journey has been changed (flag to refresh is set)
                if(!refresh) return next(); 
                // Otherwise check if available
                return checkMapAvailable(`${id}.png`, conns.s3)
                .then(r => {
                    if (!r.exists || moment().diff(moment(r.data.LastModified), 'days') >= 30)
                        return next();
                    resp.redirect(301, `https://sandy-fsf-2019.sgp1.digitaloceanspaces.com/journeys/maps/${id}.png`)
                })
            })
            .catch((e) => { console.log(e); return next(); });
        },
        (req, resp) => {
            console.log('Map is not available on s3 or is out of date...');
            const id = req.params.id;
            getPlacesByJourneyId([id]).then(r => {
                let waypoints = r.result;
                const alpha = 'ABCDEFGHIJKLMNOPQSTUVWXYZ';
                let w = waypoints.map(v => {
                    return { ...v, alpha: alpha[(v.journey_order-1) % 26] }
                });
                const qs = `size=500x500&format=png&key=${conns.gmaps}`
                let markers = '';
                let path = '&path=weight:3';
                for (let i = 0; i < w.length; i++){
                    markers += `&markers=size:med|color:yellow|label:${w[i].alpha}|${w[i].lat},${w[i].lng}`
                    path += `|${w[i].lat},${w[i].lng}`
                }
                return request.get(`https://maps.googleapis.com/maps/api/staticmap?${qs}${markers}${path}`,{ encoding: null });
            })
            .then(r =>{
                console.log(r);
                const mapFile = r;
                uploadMapToS3({key: id, s3: conns.s3, file: mapFile})
                .then(r => {
                    resp.redirect(301, `https://sandy-fsf-2019.sgp1.digitaloceanspaces.com/journeys/maps/${id}`)
                }).catch(e => resp.status(500).json({error: "Error "+ e}))
                // return resp.status(200).type('image/png').send(mapFile);
            }).catch(e => resp.status(500).json({error: "Error "+ e}))
            // return resp.json({message: 'in next'})
            
            /* Static Map Format
            https://maps.googleapis.com/maps/api/staticmap?size=600x400
            &markers=size:med|color:yellow|label:A|-36.8485,174.7633&
            markers=size:small|color:yellow|-37.8109,175.7765|-38.1368,176.2497
            &markers=size:med|color:yellow|label:O|-41.2865,174.7762
            &path=weight:3|-36.8485,174.7633|-37.8109,175.7765|-38.1368,176.2497|-41.2865,174.7762
            &key=AIzaSyBkxKnpyG9eJwk0XvQkW2-xiobbZ_Rtenk
            */
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
            resp.status(201).json({message: `Record ${b.title} inserted`, insertId: status.status});
        })
        .catch(err => {
            resp.status(500).json({error: err.error});
        });
    });

    // Edit Journey
    app.post('/api/journeys/update', upload.single('newJourneyImage'),
        mydb.unlinkFileOnResponse(), 
        (req, resp) => {
        const b = req.body;
        let f = null;
        if(req.file) { f = req.file }
        // console.log('BODY: ', b);
        // console.log('FILE: ', f);

        const updateJourney = mydb.mkTransaction(travel.editJourneys(), conns.mysql);
        updateJourney({body: b, file: f, conns: conns})  
        .then(status => {
            resp.status(201).json({message: `Record ${b.title} updated`});
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
