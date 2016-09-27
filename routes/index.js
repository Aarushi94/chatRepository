var express = require('express');
var router = express.Router();
var user=require('../models/userSchema');

/* GET home page. */
router.get('/', function(req, res, next) {
//  res.render('index', { title: 'Socket Chat I/o' });
  res.render('dummy');
});

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
