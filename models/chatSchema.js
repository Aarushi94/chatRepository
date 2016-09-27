var mongoose =require('mongoose');

var chatSchema=mongoose.Schema({
  chatId:String,
  user1:String,
  user2:String,
  chatHistory:[{
    sender:String,
    message:String
  }]
});
module.exports=mongoose.model('chats',chatSchema);
