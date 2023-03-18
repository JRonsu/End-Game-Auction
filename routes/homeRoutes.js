const express = require('express');
const router = express.Router();
const databaseManager = require('../models/database-manager');
const connectToDatabase = require('../config/database');
const { getAccounts } = require('../models/database-manager');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { ObjectId } = require('mongodb');

router.get('/', async (req, res) => {
    const db = await connectToDatabase();
    const classesCollection = db.collection('classes');
    const classes = await classesCollection.find().toArray();
    res.render('home', { classes: classes, user: req.session.user });
});
  

router.get('/classView', async (req, res) => {
    try {
      const classNames = await databaseManager.getAllClasses();
      res.render('classView', { classNames: classNames, user: req.session.user });
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
    const classNames = await databaseManager.getAllClasses(); // Add this line
    res.render('classDetails', { className, accounts, user: req.session.user });
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
      res.render('accountDetails', { className, account, user: req.session.user }); // Add user: req.session.user
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
      res.render('sold', { soldAccounts, user: req.session.user }); // Add user: req.session.user
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
    }
  });
  

  router.get('/sell', (req, res) => {
    res.render('sell', { user: req.session.user });
  });
  

  router.post('/sellAccount', async (req, res) => {
    try {
      if (!req.session.user) {
        return res.redirect('/login');
      }
  
      const { server, class: className, level, ap, dp, gearScore, silver, pearls, price } = req.body;
      const db = await connectToDatabase();
      const accountsCollection = db.collection('accounts');
  
      const account = {
        userId: req.session.user.id,
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
  
      res.redirect('/loggedSeller');
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
    }
  });
  
  router.get('/selling', (req, res) => {
    res.render('selling', { message: 'Congratulations! Your account is now up for auction.' });
  });

  router.get('/signup', (req, res) => {
    res.render('signup', { user: req.session.user });
  });
  
  


router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});

router.get('/register', (req, res) => {
    res.render('register', { user: req.session.user });
  });
  

  router.get('/login', (req, res) => {
    res.render('login', { user: req.session.user });
  });
  
  router.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
  
      if (!user) {
        return res.status(401).send('Invalid username or password');
      }
  
      const validPassword = await bcrypt.compare(password, user.password);
  
      if (!validPassword) {
        return res.status(401).send('Invalid username or password');
      }
  
      req.session.user = {
        id: user._id,
        username: user.username
      };
  
      res.redirect('/loggedUser');
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
    }
  });

  router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
  });
  
  

  router.get('/loggedUser', (req, res) => {
    if (!req.session.user) {
      return res.redirect('/login');
    }
    res.render('loggedUser', { user: req.session.user });
  });
  
  router.get('/loggedSeller', async (req, res) => {
    if (!req.session.user) {
      return res.redirect('/login');
    }
  
    const db = await connectToDatabase();
    const accountsCollection = db.collection('accounts');
    const accounts = await accountsCollection.find({ userId: req.session.user.id }).toArray();
  
    res.render('loggedSeller', { user: req.session.user, accounts: accounts });
  });
  
  
module.exports = router;
