const express = require('express');
const router = express.Router();
const databaseManager = require('../models/database-manager');
const connectToDatabase = require('../config/database');
const { ObjectId } = require('mongodb');

router.get('/', async (req, res) => {
  try {
    const accounts = await databaseManager.getAllAccounts();
    res.render('home', { accounts });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});

router.get('/classView', async (req, res) => {
  try {
    const classNames = await databaseManager.getAllClasses();
    res.render('classView', { classNames });
  } catch (err) {
    console.error(err);
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

router.get('/account/:className', async (req, res) => {
    try {
      const className = req.params.className;
      const account = await databaseManager.getAccount(className);
      const isSoldOut = account.price === 0 || account.sold === true;
      res.render('accountDetails', { account, className, isSoldOut });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
    }
  });
  
  // Add this route at the bottom of your homeRoute.js file
router.get('/buy/:accountId', async (req, res) => {
    try {
      const accountId = req.params.accountId;
      const objectId = new ObjectId(accountId);
      const db = await connectToDatabase();
      const accountsCollection = db.collection('accounts');
  
      await accountsCollection.deleteOne({ _id: objectId });
  
      res.redirect('/sold');
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
    }
  });
  
  
  router.get('/sold', async (req, res) => {
    try {
      const soldAccounts = await databaseManager.getSoldAccounts();
      res.render('sold', { soldAccounts });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
    }
  });

  router.get('/sell', (req, res) => {
    res.render('sell');
  });

  router.post('/sellAccount', async (req, res) => {
    try {
      const { server, class: className, level, ap, dp, gearScore, silver, pearls, price } = req.body;
      const db = await connectToDatabase();
      const accountsCollection = db.collection('accounts');
  
      const account = {
        server,
        Class: className,
        Level: parseInt(level),
        Ap: parseInt(ap),
        Dp: parseInt(dp),
        gearScore: parseInt(gearScore),
        Silver: parseInt(silver),
        Pearls: parseInt(pearls),
        price: parseFloat(price),
        sold: false
      };
  
      await accountsCollection.insertOne(account);
  
      res.redirect('/selling');
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
    }
  });
  
  router.get('/selling', (req, res) => {
    res.render('selling', { message: 'Congratulations! Your account is now up for auction.' });
  });
  
  
module.exports = router;
