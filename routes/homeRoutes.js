const express = require('express');
const router = express.Router();
const databaseManager = require('../models/database-manager');

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

module.exports = router;


module.exports = router;
