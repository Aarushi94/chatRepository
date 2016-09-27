var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose=require('mongoose');


//Mongo db Connection
mongoose.connect('mongodb://localhost/chatApplication');
var db=mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Mongoose is connected");
});

//These are seggregation of API's
var routes = require('./routes/index');
var users = require('./routes/users');
var userCheck=require('./models/userSchema');
var userChatHistory=require('./models/chatSchema')

var app = express();
var server=require('http').Server(app);


// Socket Connection
var io=require('socket.io')(server);
var usersOnline={};
var usersOnlineSockets={};

io.on('connection',function(socket){
  //Check user exists or not
  socket.on('login-check',function(email,pwd){
    userCheck.findOne({ 'email': email },'name', function (err, user) {
      if (err) {
        console.log("No user exists");
      }else{
        //Store socket-id in usersOnline object
        usersOnline[socket.id]=user.name;
        //Store socket in usersOnlineSockets object
        usersOnlineSockets[socket.id]=socket;
        socket.emit('welcome',user.name);
        io.emit('users-online',usersOnline);
      }

    });
  });
  //Request the person for chat
  socket.on('request-chat',function(id){
    usersOnlineSockets[id].emit("request-chat",usersOnline[socket.id],socket.id);
  });

  //Accept the chat request
  socket.on('request-chat-accepted',function(id){

    var newChat;
    //Find if any history exits between the two people
    userChatHistory.findOne({
      chatId:{
        $in:[usersOnline[socket.id] + '-' + usersOnline[id], usersOnline[id] + '-' + usersOnline[socket.id]]
      }},function(err,previousChatHistory){
        if(previousChatHistory){
          console.log("chatId already exists");
        }else{
          //Create new chat document
            newChat=new userChatHistory({
            chatId:usersOnline[socket.id] + '-' + usersOnline[id],
            user1:usersOnline[socket.id],
            user2:usersOnline[id]
          });
          newChat.save(function(error,data){
            console.log("Chat document created");
          });
        }
      }
    )
    usersOnlineSockets[id].emit("request-chat-accepted",socket.id);
  });
  //Rejected chat request
  socket.on('request-chat-rejected',function(id){
    usersOnlineSockets[id].emit("request-chat-rejected",usersOnline[socket.id]);
  });

socket.on('chat-message', function(msg,senderId){

          //Find the previous chat document
           userChatHistory.findOne({
             chatId:{
               $in:[usersOnline[socket.id] + '-' + usersOnline[senderId], usersOnline[senderId] + '-' + usersOnline[socket.id]]
            }
           }, function(error, chat) {
               chat.chatHistory.push({
                   sender: usersOnline[socket.id],
                   message: msg
               });

               //Save the chat in database
               chat.save(function() {
                   console.log('chat updated');
               });
           });

  //Emit that message to the receiver
  usersOnlineSockets[senderId].emit('chat-message-receiver',usersOnline[socket.id], msg,socket.id);
  //Emit the message to self
  socket.emit('chat-message-self',usersOnline[socket.id],msg,senderId);
});
socket.on('disconnect', function(){
  //delete Id
  delete usersOnline[socket.id];
  delete usersOnlineSockets[socket.id];
  // Show all people online
  io.emit('users-online',usersOnline);
});
});


app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', routes);
app.use('/users', users);

app.get('/login',function(req,res){
  res.render('index');
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = {app:app, server:server};
