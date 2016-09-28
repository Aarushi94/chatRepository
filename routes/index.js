var express = require('express');
var router = express.Router();
var user=require('../models/userSchema');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('dummy');
});
//Go to register link
router.get('/register',function(req,res){
  res.render('register');
});
//Check the request if the userName exists or not else
router.post('/register',function(req,res){
  user.findOne({ 'name': req.body.userName },'name', function (err, person) {
    if (person) {
      console.log('User Exists:');//+person.name );
      res.redirect('/register');
    }else{
      var p=new user({name:req.body.userName,password:req.body.password,email:req.body.email,phone:req.body.phone});
      p.save(function (err, p) {
        if (err) return console.error(err);
        else {
          res.redirect('/login');
        }
      });
    }
  });
});

module.exports = router;
