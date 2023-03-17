const express = require('express');
const router = express.Router();
const databaseManager = require('../models/database-manager');
const connectToDatabase = require('../config/database');
const { ObjectId } = require('mongodb');

const account = {
    Server: 'Server Name',
    Level: 50,
    'Gear Score': 500,
    Ap: 200,
    Dp: 300,
    Silver: 1000,
    Pearls: 500,
    Skins: ['Skin 1', 'Skin 2', 'Skin 3']
  };
  


// Render the home page
router.get('/', async (req, res) => {
  try {
    // Call the getAllAccounts function of the database manager to get all accounts from the database
    const accounts = await databaseManager.getAllAccounts();

    // Render the 'home' view and pass the accounts data to it
    res.render('home', { accounts });
  } catch (err) {
    console.error(err);
    // If an error occurs, send a 500 error status and message to the client
    res.status(500).send('Internal server error');
  }
});

// Render the class view page
router.get('/classView', async (req, res) => {
  try {
    // Call the getAllClasses function of the database manager to get all unique class names from the database
    const classNames = await databaseManager.getAllClasses();

    // Render the 'classView' view and pass the classNames data to it
    res.render('classView', { classNames });
  } catch (err) {
    console.error(err);
    // If an error occurs, send a 500 error status and message to the client
    res.status(500).send('Internal server error');
  }
});

router.get('/classView/:className', async (req, res) => {
    try {
      const className = req.params.className;
      const db = await connectToDatabase();
      const accountsCollection = db.collection('accounts');
      const accounts = await accountsCollection.find({ Class: className }).toArray();
      res.render('classDetails', { className, accounts });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
    }
});

router.get('/classView/:className/:accountId', async (req, res) => {
    try {
      const className = req.params.className;
      const accountId = req.params.accountId;
  
      // Create an ObjectId instance using the accountId parameter
      const objectId = new ObjectId(accountId);
  
      const db = await connectToDatabase();
      const accountsCollection = db.collection('accounts');
      const account = await accountsCollection.findOne({ _id: objectId });
  
      res.render('accountDetails', { className, account });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
    }
  });
  


  

  

module.exports = router;

