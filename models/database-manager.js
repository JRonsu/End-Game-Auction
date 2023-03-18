const connectToDatabase = require('../config/database');

// Async function to get all the accounts from the MongoDB database
async function getAllAccounts() {
  console.log('Getting all accounts...');
  // Connect to the database using the connectToDatabase function
  const db = await connectToDatabase();
  // Get the accounts collection from the connected database
  const accountsCollection = db.collection('accounts');
  // Find all the documents in the accounts collection and convert them to an array
  const accounts = await accountsCollection.find({}).toArray();
  // Log the retrieved accounts to the console
  console.log('Accounts:', accounts);
  // Return the retrieved accounts
  return accounts;
}

// Async function to get all the class names from the MongoDB database
async function getAllClasses() {
  console.log('Getting all class names...');
  // Connect to the database using the connectToDatabase function
  const db = await connectToDatabase();
  // Get the accounts collection from the connected database
  const classesCollection = db.collection('accounts');
  // Get an array of unique class names from the Class field in the documents
  const classNames = await classesCollection.distinct('Class');
  // Log the retrieved class names to the console
  console.log('Class Names:', classNames);
  // Return the retrieved class names
  return classNames;
}

// Async function to get all the sold accounts from the MongoDB database
async function getSoldAccounts() {
  console.log('Getting all sold accounts...');
  // Connect to the database using the connectToDatabase function
  const db = await connectToDatabase();
  // Get the accounts collection from the connected database
  const accountsCollection = db.collection('accounts');
  // Find all the sold accounts in the accounts collection and convert them to an array
  const soldAccounts = await accountsCollection.find({ sold: true }).toArray();
  // Log the retrieved sold accounts to the console
  console.log('Sold Accounts:', soldAccounts);
  // Return the retrieved sold accounts
  return soldAccounts;
}

// Export the functions to be used by other modules
module.exports = {
  getAllAccounts,
  getAllClasses,
  getSoldAccounts
};
