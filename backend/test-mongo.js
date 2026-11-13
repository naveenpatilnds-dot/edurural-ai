require('dotenv').config();

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');

async function testConnection() {
    const {
        MONGO_USER,
        MONGO_PASS,
        MONGO_HOST,
        MONGO_DB
    } = process.env;

    if (!MONGO_USER || !MONGO_PASS || !MONGO_HOST || !MONGO_DB) {
        console.log('ERROR: Missing MongoDB environment variable');
        return;
    }

    const uri =
        `mongodb+srv://${encodeURIComponent(MONGO_USER)}:${encodeURIComponent(MONGO_PASS)}@${MONGO_HOST}/${MONGO_DB}?retryWrites=true&w=majority`;

    console.log('Testing MongoDB connection...');
    console.log('Host:', MONGO_HOST);
    console.log('Database:', MONGO_DB);

    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 15000
        });

        console.log('\nSUCCESS: MongoDB connected!');
        await mongoose.disconnect();

    } catch (error) {
        console.log('\nCONNECTION FAILED');
        console.log('Error:', error.name);
        console.log('Message:', error.message);

        if (error.reason?.servers) {
            console.log('\nIndividual server errors:');

            for (const [host, server] of error.reason.servers) {
                console.log('\nHost:', host);
                console.log('Cause:', server.error?.message);
                console.log('Code:', server.error?.code);
            }
        }
    }
}

testConnection();