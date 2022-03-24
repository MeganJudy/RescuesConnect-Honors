const MongoClient = require('mongodb').MongoClient;
const assert = require('assert').strict;
const dboper = require('./operations');

const url = "mongodb://localhost:27017";
const dbname = 'rcmongodb';

MongoClient.connect(url, { useUnifiedTopology: true }).then(client => {

    console.log('Connected correctly to server');

    const db = client.db(dbname);

    db.dropCollection('dogs')
        .then(result => {
            console.log('Dropped Collection:', result);
        })
        .catch(err => console.log('No collection to drop.'));

    dboper.insertDocument(db, { name: "Hugo", description: "Test" }, 'dogs')
        .then(result => {
            console.log('Insert Document:', result.ops);

            return dboper.findDocuments(db, 'dogs');
        })
        .then(docs => {
            console.log('Found Documents:', docs);

            return dboper.updateDocument(db, { name: "Hugo" },
                { description: "Updated Test Description" }, 'dogs');
        })
        .then(result => {
            console.log('Updated Document Count:', result.result.nModified);

            return dboper.findDocuments(db, 'dogs');
        })
        .then(docs => {
            console.log('Found Documents:', docs);

            return dboper.removeDocument(db, { name: "Hugo" },
                'dogs');
        })
        .then(result => {
            console.log('Deleted Document Count:', result.deletedCount);

            return client.close();
        })
        .catch(err => {
            console.log(err);
            client.close();
        });
})
    .catch(err => console.log(err));