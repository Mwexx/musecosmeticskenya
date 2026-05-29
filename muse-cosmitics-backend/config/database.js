const mongoose = require('mongoose');
const config = require('./config');

// Connect to MongoDB
async function connectDB() {
    try {
        const conn = await mongoose.connect(config.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 15000,
            connectTimeoutMS: 15000,
            maxPoolSize: 5,
        });
        
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return true;
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        // In development, do not exit the process. Allow server to start so
        // frontend/static pages can be tested even when the DB is not reachable.
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
        return false;
    }
}

// Disconnect from MongoDB
async function disconnectDB() {
    try {
        await mongoose.connection.close();
        console.log('MongoDB disconnected');
    } catch (error) {
        console.error('MongoDB disconnect error:', error);
    }
}

// Clear database (for development)
async function clearDatabase() {
    try {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany({});
        }
        console.log('Database cleared');
    } catch (error) {
        console.error('Clear database error:', error);
    }
}

module.exports = {
    connectDB,
    disconnectDB,
    clearDatabase,
    mongoose
};