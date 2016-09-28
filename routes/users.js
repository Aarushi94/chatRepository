var express = require('express');
var router = express.Router();
var passport=require('passport');

//Authenticate the urls
router.get('/', passport.authenticate('jwt', { session: false}),
function(req, res, next) {
  res.send('respond with a resource');
}
);


router.get('/hello',passport.authenticate('jwt', { session: false}),
function(req, res, next) {
  res.send('Hello users');
}
);
module.exports = router;
