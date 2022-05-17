const mongoose = require('mongoose');

const URI = process.env.MONGODB_URI
    ? process.env.MONGODB_URI
    : 'mongodb+srv://admin:admin12345@chatdev.3secm.mongodb.net/test';

mongoose.connect(URI, {
    useNewUrlParser: true,
});

const connection = mongoose.connection;

connection.once('open', () => {
    console.log(`DB is connected: ${URI}`);
})