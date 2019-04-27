var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
var authenticate = require('../authenticate');

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', (req, res, next) => {
  const user = new User({ username: req.body.username });
  const password = req.body.password;
  const _onAuthenticate = () => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({ success: true, status: 'Registration Successful!' });
  };
  const _onRegister = (err, user) => {
    if (err) {
      res.status = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({ err: err });
    } else {
      const authenticate = passport.authenticate('local');
      authenticate(req, res, _onAuthenticate);
    }
  };
  User.register(user, password, _onRegister);
});

router.post('/login', passport.authenticate('local'), (req, res) => {
  var token = authenticate.getToken({ _id: req.user._id });
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({
    success: true,
    token: token,
    status: 'You are successfully logged in!'
  });
});

router.get('/logout', (req, res, next) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  } else {
    var err = new Error('You are not logged in!');
    err.statusCode = 403;
    next(err);
  }
});
module.exports = router;
