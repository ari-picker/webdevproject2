const { MongoClient } = require('mongodb');

const dbURL = process.env.ATLAS_URI;
let db;  // Will hold the database connection once established

// Connect to MongoDB Atlas — called once when the app starts
async function connectToDB() {
  try {
    const client = new MongoClient(dbURL);
    await client.connect();
    console.log('Connected to MongoDB');
    db = client.db("quiz_generator");  // Select our database
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;  // The caller (app.js) will catch this and log it
  }
}

// Get a reference to a specific collection (e.g. "users" or "quiz_history")
// Throws if connectToDB hasn't been called yet — prevents crashes from undefined db
function getCollection(collectionName) {
  if (!db) {
    throw new Error('Database connection not established. Call connectToDB first.');
  }
  return db.collection(collectionName);
}

module.exports = {
  connectToDB,
  getCollection,
};
