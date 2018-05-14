const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Bring in User Model 
let User = require('../models/user');

// Register Form
router.get('/register', (req, res) => {
	res.render('register');
});

// Register Process (проверка express-validator)
router.post('/register', [
	check('name').trim().isLength({min: 3}).withMessage('Name is required'),
	check('email').trim().isLength({min: 3}).withMessage('Email is required'),
	check('email').trim().isEmail().withMessage('Email is not valid'),
	check('username').trim().isLength({min: 3}).withMessage('Username is required'),
	check('password').exists().withMessage('Password is required'),
	check('password2').exists().custom((value, { req }) => value === req.body.password).withMessage('Password does not match')


], (req, res) => {
	const name = req.body.name;
	const email = req.body.email;
	const username = req.body.username;
	const password = req.body.password;
	const password2 = req.body.password2;

	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		res.render('register',
		{ 
		 errors: errors.mapped()
		});
	} else {
		let newUser = new User({
			name:name,
			email:email,
			username:username,
			password:password
		});
		bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(newUser.password, salt, (err, hash) => {
				if (err) {
					console.log(err);
				}
				newUser.password = hash;
				newUser.save((err) => {
					if (err) {
						console.log(err);
						return;						
					} else {
						req.flash('success', 'You are registred and can log in')
						res.redirect('/login');
					}
				});
			});
		});
	}
});

// Login Form
router.get('/login', (req, res) => {
	res.render('login');
});

// Login Process
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect:'/chat',
    failureRedirect:'/login',
    failureFlash: true
	})(req, res, next);	
});

// Logout
router.get('/logout', (req, res, next) => {
	req.logout();
	req.flash('success', 'You are Logged out');
	res.redirect('/login');
});

module.exports = router;