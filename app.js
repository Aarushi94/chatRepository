var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose=require('mongoose');


//Mongo db Connection
mongoose.connect('mongodb://localhost/chat');
var db=mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Mongoose is connected");
});

//These are seggregation of API's
var routes = require('./routes/index');
var users = require('./routes/users');
var peopleChat=require('./models/user');

var app = express();
var server=require('http').Server(app);


// Socket Connection
var io=require('socket.io')(server);
var people={};
var peopleSockets={};

io.on('connection',function(socket){
  //Check user exists or not
  socket.on('login-check',function(email,pwd){
    peopleChat.findOne({ 'email': email },'name', function (err, person) {
      if (err) {
        console.log("No user exists");
      }else{
        //console.log('User Exists:'+person.name );
        people[socket.id]=person.name;
        peopleSockets[socket.id]=socket;
        socket.emit('welcome',person.name);
        io.emit('people-online',people);
      }

    });
  });
  //Request the person for chat
  socket.on('request-chat',function(id){
    peopleSockets[id].emit("request-chat",people[socket.id],socket.id);
  });
  
  //Accept the chat request
  socket.on('request-chat-accepted',function(id){
    peopleSockets[id].emit("request-chat-accepted",socket.id);
  });
  //Rejected chat request
  socket.on('request-chat-rejected',function(id){
    peopleSockets[id].emit("request-chat-rejected",people[socket.id]);
  });
  /*  socket.on('join',function(name){
  //Give each people a Socket ID
  people[socket.id]=name;
  //Total people in Chat
  io.emit('totalPeople',people,socket.id);

  //Total history till now
  peopleChat.find(function(err,history){
  if (err) return console.error(err);
  console.log(history);
});
});*/
//
socket.on('chat-message', function(msg,senderId){
  //save the message in database
  //  var p=new peopleChat({name:people[socket.id],message:msg});
  //  p.save(function (err, p) {
  //      if (err) return console.error(err);
  //    });

  //Emit that message to the receiver
  peopleSockets[senderId].emit('chat-message-receiver',people[socket.id], msg,socket.id);
  //Emit the message to self
  socket.emit('chat-message-self',people[socket.id],msg,senderId);
});
socket.on('disconnect', function(){
  //delete Id
  delete people[socket.id];
  delete peopleSockets[socket.id];
  // Show all people online
  io.emit('people-online',people);
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
