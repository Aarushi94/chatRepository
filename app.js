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

io.on('connection',function(socket){
  socket.on('loginCheck',function(email,pwd){
    peopleChat.findOne({ 'email': email },'email', function (err, person) {
      if (err) {
       console.log("No user exists");
       console.log("Email"+email);
        //res.redirect('/login');
      }else{
        console.log('User Exists:'+person.email );
        console.log("Email"+email);
        //res.redirect('/');
      }

    });
  });
  socket.on('join',function(name){
    //Give each people a Socket ID
    people[socket.id]=name;
    //Total people in Chat
    io.emit('totalPeople',people);

    //Total history till now
    peopleChat.find(function(err,history){
      if (err) return console.error(err);
      console.log(history);
    });
  });
  socket.on('chat message', function(msg){
    //save the message in database
    var p=new peopleChat({name:people[socket.id],message:msg});
    p.save(function (err, p) {
        if (err) return console.error(err);
      });
      //Emit that message to all people
     io.emit('chat message',people[socket.id], msg);
  });
  socket.on('disconnect', function(){
    //delete Id from people object
    delete people[socket.id];
    // Show all people in chat
    io.emit('totalPeople',people);
  });
});


// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
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

/*
app.post('/login',function(req,res){
  socket.on('loginCheck',)
  user.findOne({ 'email': req.body.email },'name', function (err, person) {
    if (err) {
     console.log("No user exists");
      res.redirect('/login');
    }else{
      console.log('User Exists:'+person.name );
      res.redirect('/');
    }

  });
});*/



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
