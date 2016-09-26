var socket=io();
$('login').click(function(){

  socket.emit('loginCheck',$('email').val(),$('pwd').val());
  return false;
});
