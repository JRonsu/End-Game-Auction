// Import the express module and create a router object
const express = require('express');
const router = express.Router();

// Import the database manager module
const databaseManager = require('../models/database-manager');

// Set up a GET request handler for the home page
router.get('/', async (req, res) => {
    try {
        // Call the getAllAccounts function of the database manager to retrieve all the accounts
        const accounts = await databaseManager.getAllAccounts();

        // Log the retrieved accounts to the console
        console.log('Accounts:', accounts);

        // Render the home page and pass the retrieved accounts as a parameter
        res.render('home', {
            accounts
        });
    } catch (err) {
        // If there is an error, log it to the console and send a 500 status code
        console.error(err);
        res.status(500).send('Internal server error');
    }
});

// Export the router object
module.exports = router;