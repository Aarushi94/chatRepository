var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/',function(req, res, next) {
  res.send('respond with a resource');

  // res.send('welcome, ' + req.body.Name);
   res.send("Received the request");


});
router.get('/hello',function(req,res,next){
  res.send("Hello");

});
module.exports = router;
