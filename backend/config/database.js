const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const user = process.env.MONGO_USER;
        const password = process.env.MONGO_PASS;
        const host = process.env.MONGO_HOST;
        const database = process.env.MONGO_DB;

        if (!user || !password || !host || !database) {
            throw new Error('One or more MongoDB environment variables are missing.');
        }

        const mongoURI =
            `mongodb+srv://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}/${database}?retryWrites=true&w=majority`;

        console.log('Connecting to MongoDB...');
        console.log('MongoDB host:', host);
        console.log('Database:', database);

        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 15000
        });

        console.log('MongoDB Connected Successfully!');

    } catch (error) {
        console.error('========== DATABASE ERROR ==========');
        console.error('Error name:', error.name);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('====================================');

        throw error;
    }
};

module.exports = connectDB;