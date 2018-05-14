const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const config = require('./config/database');
const passport = require('passport');
const socket = require('socket.io');

// Init app
const app = express();

mongoose.connect(config.db);
let db = mongoose.connection;

// Check connection
db.once('open', function(){
	console.log('Connected to MongoDB');
	
});

// Check for DB errors
db.on('error', function(err){
	console.log(err);
});

// Load view engine
app.set('views', path.join(__dirname, 'views') );
app.set('view engine', 'pug');

//Express session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Passport Config
require('./config/passport')(passport);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// Home Route
app.get('/', (req, res) => {
	res.render('index');
});

const server = app.listen(4000, () => {
	console.log('Server started on porn 4000');	
});

const io = socket(server);

io.on('connection', (socket) => {
  socket.on('chat', (data) => {
    io.sockets.emit('chat', data)
  });

  socket.on('typing_text', (data) => {
    socket.broadcast.emit('typing_text', data);
  })
});

//
app.get('*', (req, res, next) => {
	res.locals.user = req.user || null;
	next();
});

// Access Control
function ensureAuthenticated (req, res, next) {
	if (req.isAuthenticated()){
		return next();
	} else {
		req.flash('danger', 'Please Sign In');
		res.redirect('/login');
	}
}

// Chat Route
app.get('/chat', ensureAuthenticated, (req, res) => {
	res.render('messenger');
});

// Route Files
let users = require ('./routes/users');
app.use('/', users);
