const connectToDatabase = require('../config/database');

async function getAllAccounts() {
  console.log('Getting all accounts...');
  const db = await connectToDatabase();
  const accountsCollection = db.collection('accounts');
  const accounts = await accountsCollection.find({}).toArray();
  return accounts;
}


module.exports = {
  getAllAccounts,
};
