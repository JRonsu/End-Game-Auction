const databaseManager = require('../models/database-manager');

exports.getMyAccounts = async (req, res) => {
    try {
        // Call the function to get user accounts
        const accounts = await databaseManager.getUserAccounts();

        // Render the "my-accounts" EJS template and pass the accounts as a parameter
        res.render('my-accounts', {
            accounts
        });
    } catch (err) {
        // If there is an error, log it to the console and send a 500 status code
        console.error(err);
        res.status(500).send('Internal server error');
    }
};