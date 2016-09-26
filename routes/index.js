var express = require('express');
var router = express.Router();
var user=require('../models/user');

/* GET home page. */
router.get('/', function(req, res, next) {
//  res.render('index', { title: 'Socket Chat I/o' });
  res.render('dummy');
});
/*
router.get('/login',function(req,res){
  res.render('login');
});
router.post('/login',function(req,res){
  user.findOne({ 'email': req.body.email },'name', function (err, person) {
    if (err) {
     console.log("No user exists");
      res.redirect('/register');
    }else{
      console.log('User Exists:'+person.name );
      res.redirect('/');
    }

  });
});
*/
router.get('/register',function(req,res){
  res.render('register');
});

router.post('/register',function(req,res){
  console.log("Email:"+req.body.email);
  console.log("Password:"+req.body.password);
  user.findOne({ 'email': req.body.email },'name', function (err, person) {
    if (person) {
      console.log('User Exists:'+person.name );
      res.redirect('/register');
    }else{
      var p=new user({name:req.body.name,password:req.body.password,email:req.body.email,phone:req.body.phone});
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
