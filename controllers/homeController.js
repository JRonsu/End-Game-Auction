const express = require('express');
const router = express.Router();
const databaseManager = require('../models/database-manager');

router.get('/', async (req, res) => {
    try {
      const accounts = await databaseManager.getAllAccounts();
      console.log('Accounts:', accounts);
      res.render('home', { accounts });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
    }
  });
  

module.exports = router;
