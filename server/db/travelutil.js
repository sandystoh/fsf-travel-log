const mydb = require('../db/mydbutil');
const sql = require('../db/sqlutil');
const uuid = require('uuid');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const journeys_columns = "title, owner, type, date, end_date, description, image_url";
const insertJourney = mydb.trQuery(sql.writeInsert('journeys', journeys_columns));
const uploadJourneyImageToS3 = mydb.s3Upload('sandy-fsf-2019', 'journeys');
    // Transaction with Journey (MySQL) + Image (S3)
    function mkJourneys() {
        return (status) => {
            const b = status.body;
            let f = null, filepath = '';
            if (status.file) {
                f = status.file;
                filepath = `${b.owner}/${f.filename}`;
            }
            const connection = status.connection;
            b.date = (b.date !== 'null') ? b.date : null;
            const params = [b.title, b.owner, b.type, b.date, b.end_date, b.description, filepath];
            return insertJourney({params, connection})
            .then(s => {
                s.insertId = s.result.insertId;
                if(f) {
                    s.file = f, s.filepath = filepath;
                    s.s3 = status.conns.s3;
                    return uploadJourneyImageToS3(s).then(() => { return Promise.resolve(s.insertId);});
                }
                else return Promise.resolve(s.insertId);
            })
        }
    }

const journeys_update_columns = "title, type, date, end_date, description, image_url, last_updated";
const updateJourney = mydb.trQuery(sql.writeUpdate('journeys', journeys_update_columns, 'id = ?'));
const updateJourneyPlaces = mydb.trQuery(`update places set type = ? where id = ? `);
const deleteJourneyImageFromS3 = mydb.s3Delete('sandy-fsf-2019', 'journeys');
const deleteJourneyThumbnailFromS3 = mydb.s3Delete('sandy-fsf-2019', 'journeys/thumbnails');
    // Transaction with Journey (MySQL) + Image (S3)
    function editJourneys() {
        return (status) => {
            const b = status.body;
            let f = null, filepath = '';
            if (status.file) {
                // Change Image
                f = status.file;
                filepath = `${b.owner}/${f.filename}`;
            } else {
                // Retain old image
                if(b.image_url !== '') filepath = b.image_url;
            }
            const connection = status.connection;
            const params = [b.title, b.type, b.date, b.end_date, b.description, filepath, new Date(), b.id];
            return updateJourney({params, connection})
            .then(s => {
                console.log('here');
                if(!(b.old_type == b.type) && b.place_ids.length) {
                    for (let p of b.place_ids.split(',')) {
                        console.log(p, b.type);
                        updateJourneyPlaces({params:[b.type, parseInt(p)], connection})
                    }
                    return Promise.resolve(s);
                }
                return Promise.resolve(s);
            })
            .then(s => {
                console.log('here2');
                if(f) {
                    console.log('f',f, s)
                    s.file = f, s.filepath = filepath;
                    s.s3 = status.conns.s3;
                    return uploadJourneyImageToS3(s).then(() => { return Promise.resolve(s.insertId);})
                    .then(() => console.log('then')).catch(e => console.log(e));
                }
                else return Promise.resolve();
            })
            .then(s => {
                console.log('here3');
                if(f && !b.image_url == '') {
                    return deleteJourneyImageFromS3({image_url: b.image_url, s3: status.conns.s3})
                    .then(() => {
                        deleteJourneyThumbnailFromS3({image_url: b.image_url, s3: status.conns.s3});
                    })
                }
                else return Promise.resolve();
            })
        }
    }

const getJourneyOrder = mydb.trQuery("select num_places as count from journeys where id = ?");
const updateJourneyOrder = mydb.trQuery("update journeys set num_places = ?, refresh_map = 1 where id = ?");
const places_columns = "journey_id, journey_order, type, title, location_name, owner, date, lat, lng, country, rating, image_url, description, private_notes";
const insertPlace = mydb.trQuery(sql.writeInsert('places', places_columns));
const uploadPlaceImageToS3 = mydb.s3Upload('sandy-fsf-2019', 'places');

// Transaction with Place (MySQL) + Image (S3)
    function mkPlaces() {
        return (status) => {
            const b = status.body;
            let f = null, filepath = '';
            if (status.file) {
                f = status.file;
                filepath = `${b.owner}/${f.filename}`;
            }
            const connection = status.connection;
            let journey_order = 0;

            const journey_id = parseInt(b.journey_id);
            if(journey_id !== 0) {
                return getJourneyOrder({params:[b.journey_id], connection})
                .then(r => {
                    journey_order = r.result[0].count + 1;
                    return updateJourneyOrder({params: [journey_order, b.journey_id], connection});
                })
                .then(r => {
                    const params = [b.journey_id, journey_order, b.type, b.title, b.location_name, b.owner, b.date, b.lat, b.lng, b.country, 
                        b.rating, filepath, b.description, b.private_notes];
                    return insertPlace({params, connection});
                })
                .then(s => {
                    s.insertId = s.result.insertId;
                    if(f) {
                        s.file = f, s.filepath = filepath;
                        s.s3 = status.conns.s3;
                        return uploadPlaceImageToS3(s).then(() => { return Promise.resolve(s.insertId);});
                    }
                    else return Promise.resolve(s.insertId);
                });
            }
            else { // Not tagged to a Journey
                const params = [0, 0, b.type, b.title, b.location_name, b.owner, b.date, b.lat, b.lng, b.country, b.rating, filepath, b.description, b.private_notes];
                return insertPlace({params, connection})
                .then(s => {
                    s.insertId = s.result.insertId;
                    if(f) {
                        s.file = f, s.filepath = filepath;
                        s.s3 = status.conns.s3;
                        return uploadPlaceImageToS3(s).then(() => { return Promise.resolve(s.insertId);});
                    }
                    else return Promise.resolve(s.insertId);
                });
            }
        }
    }

const places_update_columns = "title, journey_id, journey_order, type, date, rating, description, image_url, private_notes, last_updated";
const updatePlace = mydb.trQuery(sql.writeUpdate('places', places_update_columns, 'id = ?'));
const deletePlaceImageFromS3 = mydb.s3Delete('sandy-fsf-2019', 'places');
const deletePlaceThumbnailFromS3 = mydb.s3Delete('sandy-fsf-2019', 'places/thumbnails');
    // Transaction with Journey (MySQL) + Image (S3)
    function editPlaces() {
        return async (status) => {
            console.log('OLD FILE', status.old)
            console.log('NEW FILE', status.body)
            const connection = status.connection;
            const b = status.body;
            let f = null, filepath = '';
            if (status.file) {
                // Change Image
                f = status.file;
                filepath = `${b.owner}/${f.filename}`;
            } else {
                // Retain old image
                if(status.old.image_url !== '') filepath = status.old.image_url;
            }

            let changeJourney = false;
            if (parseInt(b.journey_id) !== status.old.journey_id) {
                if (parseInt(b.journey_id) == 0) { b.journey_order = 0;  }
                else await getJourneyOrder({params:[parseInt(b.journey_id)], connection})
                .then(r => { changeJourney = true; b.journey_order =  r.result[0].count + 1;})
            } else { b.journey_order = status.old.journey_order;}
            
            const params = [b.title, b.journey_id, b.journey_order, b.type, b.date, b.rating, b.description, filepath, b.private_notes, new Date(), b.id];
            return updatePlace({params, connection})
            .then(s => {
                if(f) {
                    s.file = f, s.filepath = filepath;
                    s.s3 = status.conns.s3;
                    return uploadPlaceImageToS3(s);
                }
                else return Promise.resolve();
            })
            .then(s => {
                if(f && !status.old.image_url == '') {
                    return deletePlaceImageFromS3({image_url: status.old.image_url, s3: status.conns.s3})
                    .then(() => {
                        deletePlaceThumbnailFromS3({image_url: status.old.image_url, s3: status.conns.s3});
                    })
                }
                else return Promise.resolve();
            })
            .then(r => {
                if(parseInt(b.journey_id) !== status.old.journey_id) {
                     // Otherwise adjust journey_order for old journey
                    return updateOrder({params: [status.old.journey_id, status.old.journey_order], connection})
                    .then(() => { return updateJourneyCount({params: [status.old.journey_id], connection})})
                }  
                return Promise.resolve(); // No need to adjust order
            })
            .then(r => {
                if(changeJourney) {
                    return updateJourneyOrder({params: [b.journey_order, b.journey_id], connection});
                }  
                return Promise.resolve(); // No need to adjust order
            })
        }
    }

const selectPlaceForDelete = mydb.trQuery(`Select * from places where id = ? for update`);
const deactivatePlace = mydb.trQuery(`Update places set journey_id = 0, journey_order = 0, active = 0 where id = ?`);
const updateOrder = mydb.trQuery('Update places set journey_order = journey_order-1 where journey_id = ? and journey_order > ? and active = 1');
const updateJourneyCount = mydb.trQuery('Update journeys set num_places = num_places-1, refresh_map = 1 where id = ?');

// Transaction to Deactivate Place
    function rmPlaces() {
        return (status) => {
            const id = status.id;
            const connection = status.connection;
            let journey_id = 0;
            let journey_order = 0;
            return selectPlaceForDelete({params: [id], connection})
            .then(r => {
                if(!r.result[0].active) return Promise.reject({error:'Already Deleted'});
                journey_id = r.result[0].journey_id;
                journey_order = r.result[0].journey_order;
                return deactivatePlace({params: [id], connection});
            })
            .then(r => {
                if(journey_id == 0) return Promise.resolve(); // No need to adjust order
                // Otherwise adjust journey_order
                return updateOrder({params: [journey_id, journey_order], connection})
            })
            .then(r => {
                if(journey_id == 0) return Promise.resolve();
                return updateJourneyCount({params: [journey_id], connection})
            })
        }
    }

const deactivateJourney = mydb.trQuery(`Update journeys set num_places = 0, active = 0 where id = ?`);
const deactivatePlacesByJourneyId = mydb.trQuery(`Update places set journey_id = 0, journey_order = 0, active = 0 where journey_id = ? and active = 1`);
const untagPlacesFromJourney = mydb.trQuery(`Update places set journey_id = 0, journey_order = 0 where journey_id = ? and active = 1`);

// Transaction to Deactivate Journey
function rmJourneys() {
    return (status) => {
        const id = status.id;
        const remove_child = status.remove_child === 'true';
        const connection = status.connection;
        return deactivateJourney({params: [id], connection})
        .then(r => {
            if(!remove_child) {
                return untagPlacesFromJourney({params: [id], connection});
            }
            return deactivatePlacesByJourneyId({params: [id], connection});
        })
    }
}

module.exports = { mkJourneys, editJourneys, mkPlaces, editPlaces, rmPlaces, rmJourneys };