// Load environment variables from .env file
require('dotenv').config();

// Import the MongoClient module
const MongoClient = require('mongodb').MongoClient;

// Retrieve the MongoDB connection string from the environment variables
const uri = process.env.MONGODB_URI;

// Create a new MongoClient instance with specified connection options
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

/**
 * Connects to the MongoDB database and returns the database object.
 *
 * @returns {Promise} A Promise that resolves to the database object.
 */
module.exports = async function connect() {
  try {
    // Attempt to connect to the MongoDB server
    await client.connect();
    console.log('Connected to MongoDB Atlas');

    // Return the database object
    const db = client.db();
    return db;
  } catch (err) {
    // If an error occurs, log the error and re-throw it
    console.error(err);
    throw err;
  }
};
