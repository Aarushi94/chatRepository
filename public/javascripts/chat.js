

var socket = io();

$(document).ready(function(){
  $('#myModal').modal('show');


$('#login').click(function(){
  console.log($('email').val());
  socket.emit('loginCheck',$('email').val(),$('pwd').val());
  return false;
});


$('#nameSubmit').click(function(){
  socket.emit("join",$('#name').val());
  $('#Namediv').hide();
  $('#welcome').append($('<p>').text("Welcome "+$('#name').val()+"!"));
});

socket.on('totalPeople', function(people){
  var str="";
  $.each(people,function(id,name){
    str=str+name+" ";
  });
  $('#totalPeople').empty();
  $('#totalPeople').append($('<p>').text("People in chat:"+str));
});


$('#messageForm').submit(function(){
socket.emit('chat message', $('#m').val());
$('#m').val('');
return false;
});
socket.on('chat message', function(name,msg){
$('#messages').append($('<li>').text(name+": "+msg));
});
});
