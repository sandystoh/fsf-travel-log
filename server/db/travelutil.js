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

module.exports = { mkPlaces, mkJourneys };