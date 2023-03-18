const express = require('express');
const router = express.Router();
const databaseManager = require('../models/database-manager');
const connectToDatabase = require('../config/database');
const { getAccounts } = require('../models/database-manager');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { ObjectId } = require('mongodb');

// Home route
router.get('/', async (req, res) => {
  const db = await connectToDatabase(); // Connect to the database
  const classesCollection = db.collection('classes');
  const classes = await classesCollection.find().toArray(); // Get all classes from the database
  res.render('home', { classes: classes, user: req.session.user }); // Render home view and pass the classes and logged-in user object
});

// Class View route
router.get('/classView', async (req, res) => {
  try {
    const classNames = await databaseManager.getAllClasses(); // Get all class names from the database
    res.render('classView', { classNames: classNames, user: req.session.user }); // Render classView view and pass the class names and logged-in user object
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});

// Class Details route
router.get('/classView/:className', async (req, res) => {
  try {
    const className = req.params.className;
    const db = await connectToDatabase(); // Connect to the database
    const accountsCollection = db.collection('accounts');
    const accounts = await accountsCollection.find({ Class: className }).toArray(); // Get all accounts for the specified class from the database
    const classNames = await databaseManager.getAllClasses(); // Get all class names from the database
    res.render('classDetails', { className, accounts, user: req.session.user }); // Render classDetails view and pass the class name, accounts, and logged-in user object
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});

// Account Details route
router.get('/classView/:className/:accountId', async (req, res) => {
  try {
    const className = req.params.className;
    const accountId = req.params.accountId;
    const objectId = new ObjectId(accountId);
    const db = await connectToDatabase(); // Connect to the database
    const accountsCollection = db.collection('accounts');
    const account = await accountsCollection.findOne({ _id: objectId }); // Get the specified account from the database
    res.render('accountDetails', { className, account, user: req.session.user }); // Render accountDetails view and pass the class name, account, and logged-in user object
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});

// Buy route
router.get('/buy/:accountId', async (req, res) => {
  try {
    const accountId = req.params.accountId;
    const objectId = new ObjectId(accountId);
    const db = await connectToDatabase(); // Connect to the database
    const accountsCollection = db.collection('accounts');
    await accountsCollection.deleteOne({ _id: objectId }); // Delete the specified account from the database
    res.redirect('/sold');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});
  
  
router.get('/sold', async (req, res) => {  // Handles GET requests for '/sold' endpoint
    try {
      const soldAccounts = await databaseManager.getSoldAccounts();  // Get sold accounts from database using databaseManager.getSoldAccounts() method
      res.render('sold', { soldAccounts, user: req.session.user }); // Render 'sold' view passing sold accounts and user object as data
    } catch (err) {
      console.error(err);  // Log error to the console
      res.status(500).send('Internal server error');  // Send 500 internal server error response
    }
  });
  
  router.get('/sell', (req, res) => {  // Handles GET requests for '/sell' endpoint
    res.render('sell', { user: req.session.user });  // Render 'sell' view passing user object as data
  });
  
  router.post('/sellAccount', async (req, res) => {  // Handles POST requests for '/sellAccount' endpoint
    try {
      if (!req.session.user) {  // Check if user is logged in or not
        return res.redirect('/login');  // Redirect user to login page if not logged in
      }
  
      const { server, class: className, level, ap, dp, gearScore, silver, pearls, price } = req.body;  // Destructure account data from request body
      const db = await connectToDatabase();  // Connect to database
      const accountsCollection = db.collection('accounts');  // Get accounts collection from database
  
      const account = {  // Create new account object
        userId: req.session.user.id,  // Set user id
        server,  // Set server
        Class: className,  // Set class name
        Level: parseInt(level),  // Set level as integer
        Ap: parseInt(ap),  // Set ap as integer
        Dp: parseInt(dp),  // Set dp as integer
        gearScore: parseInt(gearScore),  // Set gear score as integer
        Silver: parseInt(silver),  // Set silver as integer
        Pearls: parseInt(pearls),  // Set pearls as integer
        price: parseFloat(price),  // Set price as float
        sold: false  // Set sold as false
      };
  
      await accountsCollection.insertOne(account);  // Insert account into database
      res.redirect('/loggedSeller');  // Redirect user to loggedSeller page
    } catch (err) {
      console.error(err);  // Log error to the console
      res.status(500).send('Internal server error');  // Send 500 internal server error response
    }
  });
  
  router.get('/selling', (req, res) => {  // Handles GET requests for '/selling' endpoint
    res.render('selling', { message: 'Congratulations! Your account is now up for auction.' });  // Render 'selling' view passing message as data
  });
  
  router.get('/signup', (req, res) => {  // Handles GET requests for '/signup' endpoint
    res.render('signup', { user: req.session.user });  // Render 'signup' view passing user object as data
  });


  router.post('/signup', async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10); // Hash the password using bcrypt with a salt of 10 rounds
      const user = new User({ username, email, password: hashedPassword }); // Create a new user object with the username, email, and hashed password
      await user.save(); // Save the new user to the database
      res.redirect('/login'); // Redirect to the login page
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
    }
  });
  
  router.get('/register', (req, res) => {
      res.render('register', { user: req.session.user }); // Render the register page with the user object from the session
    });
    
  
    router.get('/login', (req, res) => {
      res.render('login', { user: req.session.user }); // Render the login page with the user object from the session
    });
    
    router.post('/login', async (req, res) => {
      try {
        const { username, password } = req.body;
        const user = await User.findOne({ username }); // Find the user with the given username in the database
    
        if (!user) {
          return res.status(401).send('Invalid username or password'); // If the user is not found, return an error message
        }
    
        const validPassword = await bcrypt.compare(password, user.password); // Compare the hashed password with the provided password
    
        if (!validPassword) {
          return res.status(401).send('Invalid username or password'); // If the password is incorrect, return an error message
        }
    
        req.session.user = {
          id: user._id,
          username: user.username
        }; // Set the user object in the session to the user's ID and username
    
        res.redirect('/loggedUser'); // Redirect to the logged-in user page
      } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
      }
    });
  
    router.get('/logout', (req, res) => {
      req.session.destroy(); // Destroy the session
      res.redirect('/'); // Redirect to the homepage
    });
    
    
  
    router.get('/loggedUser', (req, res) => {
      if (!req.session.user) {
        return res.redirect('/login'); // If there is no user in the session, redirect to the login page
      }
      res.render('loggedUser', { user: req.session.user }); // Render the logged-in user page with the user object from the session
    });
    
    router.get('/loggedSeller', async (req, res) => {
      if (!req.session.user) {
        return res.redirect('/login'); // If there is no user in the session, redirect to the login page
      }
    
      const db = await connectToDatabase(); // Connect to the database
      const accountsCollection = db.collection('accounts'); // Get the accounts collection
      const accounts = await accountsCollection.find({ userId: req.session.user.id }).toArray(); // Find all accounts belonging to the logged-in user
    
      res.render('loggedSeller', { user: req.session.user, accounts: accounts }); // Render the logged-in seller page with the user object and accounts belonging to the user
    });
    

    router.get('/update/:id', async (req, res) => {
        try {
          const accountId = req.params.id;
          const db = await connectToDatabase();
          const accountsCollection = db.collection('accounts');
          const account = await accountsCollection.findOne({ _id: ObjectId(accountId) });
      
          if (!account) {
            return res.status(404).send('Account not found');
          }
      
          res.render('update', { account });
        } catch (err) {
          console.error(err);
          res.status(500).send('Internal server error');
        }
      });
      
      router.post('/update/:id', async (req, res) => {
        try {
          const accountId = req.params.id;
          const { server, class: className, level, ap, dp, gearScore, silver, pearls, price } = req.body;
          const db = await connectToDatabase();
          const accountsCollection = db.collection('accounts');
      
          const result = await accountsCollection.updateOne(
            { _id: ObjectId(accountId) },
            {
              $set: {
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
              }
            }
          );
      
          if (result.modifiedCount === 0) {
            return res.status(404).send('Account not found');
          }
      
          res.redirect(`/accounts/${accountId}`);
        } catch (err) {
          console.error(err);
          res.status(500).send('Internal server error');
        }
      });

      
      router.get('/accounts/:id/edit', async (req, res) => {
        try {
          const db = await connectToDatabase();
          const accountsCollection = db.collection('accounts');
          const account = await accountsCollection.findOne({ _id: new ObjectId(req.params.id) });
      
          if (!account) {
            return res.status(404).send('Account not found');
          }
      
          res.render('edit', { account, user: req.session.user }); // Pass the user object here
        } catch (err) {
          console.error(err);
          res.status(500).send('Internal server error');
        }
      });
      
    
  module.exports = router;
  