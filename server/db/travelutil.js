const mydb = require('../db/mydbutil');
const sql = require('../db/sqlutil');
const uuid = require('uuid');

const journeys_columns = "title, owner, type, date, description";
const insertJourney = mydb.trQuery(sql.writeInsert('journeys', journeys_columns));
const uploadJourneyImageToS3 = mydb.s3Upload('sandy-paf-2019', 'journeys');
    // Transaction with Journey (MySQL) + Image (S3)
    function mkJourneys() {
        return (status) => {
            const b = status.body;
            let f = null, filepath = 'default/journey-image1';
            if (status.file) {
                f = status.file;
                filepath = `${b.owner}/${f.filename}`;
            }
            const connection = status.connection;
            const params = [b.title, b.owner, b.type, b.date, b.description];
            return insertJourney({params, connection})
            .then(s => {
                if(f) {
                    s.file = f, s.filepath = filepath;
                    s.s3 = status.conns.s3;
                    return uploadJourneyImageToS3(s);
                }
                else return Promise.resolve();
            }); 
        }
    }

const getJourneyOrder = mydb.trQuery("select num_places as count from journeys where id = ?");
const updateJourneyOrder = mydb.trQuery("update journeys set num_places = ? where id = ?");
const places_columns = "journey_id, journey_order, type, title, owner, date, lat, lng, country, rating, image_url, description, private_notes";
const insertPlace = mydb.trQuery(sql.writeInsert('places', places_columns));
const uploadPlaceImageToS3 = mydb.s3Upload('sandy-paf-2019', 'places');

// Transaction with Place (MySQL) + Image (S3)
    function mkPlaces() {
        return (status) => {
            const b = status.body;
            let f = null, filepath = 'default/place-image1';
            if (status.file) {
                f = status.file;
                filepath = `${b.owner}/${f.filename}`;
            }
            const connection = status.connection;
            let journey_order = 0;
            return getJourneyOrder({params:[b.journey_id], connection})
            .then(r => {
                journey_order = r.result[0].count + 1;
                return updateJourneyOrder({params: [journey_order, b.journey_id], connection});
            })
            .then(r => {
                const params = [b.journey_id, journey_order, b.type, b.title, b.owner, b.date, b.lat, b.lng, b.country, b.rating, filepath, b.description, b.private_notes];
                return insertPlace({params, connection});
            })
            .then(s => {
                if(f) {
                    s.file = f, s.filepath = filepath;
                    s.s3 = status.conns.s3;
                    return uploadPlaceImageToS3(s);
                }
                else return Promise.resolve();
            }); 
        }
    }

const selectPlaceForDelete = mydb.trQuery(`Select * from places where id = ? for update`);
const deactivatePlace = mydb.trQuery(`Update places set journey_order = 0, active = 0 where id = ?`);
const updateOrder = mydb.trQuery('Update places set journey_order = journey_order-1 where journey_id = ? and journey_order > ? and active = 1')

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
        }
    }

const deactivateJourney = mydb.trQuery(`Update journeys set active = 0 where id = ?`);
const deactivatePlacesByJourneyId = mydb.trQuery(`Update places set journey_order = 0, active = 0 where journey_id = ? and active = 1`);

// Transaction to Deactivate Journey
function rmJourneys() {
    return (status) => {
        const id = status.id;
        const remove_child = status.remove_child === 'true';
        const connection = status.connection;
        return deactivateJourney({params: [id], connection})
        .then(r => {
            if(!remove_child) return Promise.resolve();
            return deactivatePlacesByJourneyId({params: [id], connection});
        })
    }
}

module.exports = { mkPlaces, mkJourneys, rmPlaces, rmJourneys };