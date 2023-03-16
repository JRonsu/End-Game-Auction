const express = require('express');
const path = require('path');
const ejs = require('ejs');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const connectToDatabase = require('./config/database');

const homeController = require('./controllers/homeController');
const homeRoutes = require('./routes/homeRoutes');

const app = express();

// Set up EJS as the view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set up the session store
const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: 'accounts'
});

app.use('/', homeRoutes);

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
app.use('/', homeController);

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
