var mongoose =require('mongoose');
var Schema = mongoose.Schema;
var chatSchema=new Schema({
  name:String,
  password:String,
  email:String,
  phone:String,

});
module.exports=mongoose.model('users',chatSchema);
