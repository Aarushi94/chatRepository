var express = require('express');
var router = express.Router();
var userCheck=require('../models/userSchema');
var jwt=require('jsonwebtoken');

router.post('/', function(req, res, next) {
  userCheck.findOne({ 'name': req.body.userName,'password':req.body.password }, function (err, user) {
    if (err||user==null) {
      console.log("No user exists");
    }else{
      var jwtToken=jwt.sign({name:req.body.userName},'Aarushi');
      jwtToken="JWT "+jwtToken;
      res.send(jwtToken);
    }
  });
});
module.exports = router;
