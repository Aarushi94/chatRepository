var express = require('express');
var router = express.Router();
var user=require('../models/userSchema');
var passport=require('passport');
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
  console.log('Reached to server register');
  console.log(req.body);
  user.findOne({ 'name': req.body.userName },'name', function (err, person) {
    if (person) {
      console.log('UserName Exists');//+person.name );
      res.send('Error');
    }else{
     var p=new user({name:req.body.userName,password:req.body.password,email:req.body.email,phone:req.body.phone});
      p.save(function (err, p) {
        if (err) return console.error(err);
        else {
          res.send('Success');
        }
      });
    }
  });
});

router.post('/authenticate',passport.authenticate('jwt', { session: false}),
function(req, res, next) {
  console.log(req.user.name);
  //console.log('Authenticate Server side:'+req.body);
  res.send({'result':'Success','userName':req.user.name});
});
module.exports = router;
