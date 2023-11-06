require('dotenv').config();
const mongoose = require('mongoose');

exports.connect = () => {
    return new Promise((resolve, reject) => {
        mongoose.connect(process.env.MONGO_DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false,
        });
        const mongoCon = mongoose.connection;
        mongoCon.on('open', () => {
            console.log('Connected to MongoDB');
            resolve();
        });

        mongoCon.on('error', err => {
            console.log('Error connecting to MongoDB', err);
            reject();
        });
    });
};

exports.disconnect = () => {
    return new Promise((resolve, reject) => {
        const mongoCon = mongoose.connection;
        mongoose.disconnect();

        mongoCon.on('disconnected', () => {
            console.log('Disconnected to MongoDB');
            resolve();
        });
        mongoCon.on('error', err => {
            console.log('Error cdisonnecting to MongoDB', err);
            reject();
        });
    });
};
