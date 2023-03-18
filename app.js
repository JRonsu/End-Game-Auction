const express = require('express');
const path = require('path');
const ejs = require('ejs');
const session = require('express-session');
const mongoose = require('mongoose');


const MongoDBStore = require('connect-mongodb-session')(session);
const connectToDatabase = require('./config/database');
const { getAccount } = require('./models/database-manager');

const homeController = require('./controllers/homeController');
const homeRoutes = require('./routes/homeRoutes');

const app = express();

// Set up EJS as the view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set up the session store
const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: 'sessions'
});

store.on('error', (err) => {
  console.error(err);
});

// Set up session middleware
app.use(session({
  secret: 'mysecret',
  resave: false,
  saveUninitialized: false,
  store: store
}));

// Set up middleware to parse JSON data in requests
app.use(express.json());

// Set up middleware to parse URL-encoded data in requests
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Set up routes
app.use('/', homeRoutes); // Use the routes defined in homeRoutes

const mongooseOptions = {
  serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
};

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error(err));
// Connect to MongoDB Atlas and start the server
connectToDatabase()
  .then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
