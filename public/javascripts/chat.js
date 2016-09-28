var socket = io();

$(document).ready(function(){
  //Show login modal
  $('#myModal').modal('show');


  //On login click generate socket
  $('#login').click(function(){
    socket.emit('login-check',$('#email').val(),$('#pwd').val());
    return false;
  });

  //Welcome User with name
  socket.on('welcome',function(name){
    $('#welcome').append($('<p>').text("Welcome "+name+"!"));
  });


  //Get all Online People
  socket.on('users-online', function(people){

    var list=$("<ol/>");
    $.each(people,function(id,name){
      var str="<li class='online' id='"+id+"'>"+name+"</li>";
      list.append(str);
    });
    $('#peopleOnlineDiv').empty();
    $('#peopleOnlineDiv').append(list);
  });

  //Send Request to particular user
  $(document).on('click','.online',function(){
    var personId=this.id;
    socket.emit('request-chat',personId);
  });

  //Show request of the sender
  socket.on('request-chat',function(name,senderId){

    var yes="<button id='"+senderId+"' class='btn btn-primary yes'>Yes</button>"
    var no="<button id='"+senderId+"' class='btn btn-primary no'>No</button>"
    $('#request').empty();
    $('#request').append($("<p>").text(name+" requested to chat. Do You want to Confirm?"));
    $('#request').append(yes);
    $('#request').append(no);
    $('#request').show();

  });

  //Accept request of the sender
 $(document).on('click','.yes',function(){

   var receiverId=this.id;
   var tempId=receiverId.replace("#","");
   tempId=tempId.replace("/","");

   //Show message div
   var div=$("<div/>");
   var form="<form action=''  id='messageForm'><input id='m"+tempId+"' autocomplete='off' />"+
   "<button id='"+receiverId+"' class='sendMessageButton'>Send</button><input id='"+receiverId+"' class='fileChoose' type='file'/>"

   var li="<ul id='messages"+tempId+"'class='messagesClass'></ul>"
   div.append(form);
   div.append(li);
   $('#messageChatDiv').append(div);

   //Emit socket event to show messsage div at sender side
   socket.emit('request-chat-accepted',receiverId);
  $('#request').hide();
 });

 //Reject request of the sender
 $(document).on('click','.no',function(){
   var receiverId=this.id;
   socket.emit('request-chat-rejected',receiverId);
   $('#request').hide();
 });

//Show rejected div
socket.on('request-chat-rejected',function(name){
  $('#rejectDiv').append($('<p>').text(name+" rejected your request."))
});

//Show chat message div on accepting request
socket.on('request-chat-accepted',function(receiverId){
  var tempId=receiverId.replace("#","");
  tempId=tempId.replace("/","");
  var div=$("<div/>")
  var form="<form action='' id='messageForm'><input id='m"+tempId+"' autocomplete='off' />"+
  "<button id='"+receiverId+"' class='sendMessageButton'>Send</button><input id='"+receiverId+"' class='fileChoose' type='file'/>"
  var li="<ul id='messages"+tempId+"'class='messagesClass'></ul>"
  div.append(form);
  div.append(li);
  $('#messageChatDiv').append(div);

});

//return false so thta page is not reloaded
$('#messageChatDiv').on('submit','#messageForm',function(){
  return false;
});

//On click of send button, send message and Id to the server
$(document).on('click','.sendMessageButton',function(){
  var receiverId=this.id;
  var tempId=receiverId.replace("#","");
  tempId=tempId.replace("/","");

  socket.emit('chat-message', $('#m'+tempId).val(),receiverId);
  $('#m'+tempId).val('');
 });

//On sending message append message to self box
socket.on('chat-message-self', function(name,msg,receiverId){
  var tempId=receiverId.replace("#","");
  tempId=tempId.replace("/","");
  $('#messages'+tempId).append($('<li>').text(name+": "+msg));

 });

//On receiving message append message to the person's chat box
socket.on('chat-message-receiver', function(name,msg,receiverId){
  var tempId=receiverId.replace("#","");
  tempId=tempId.replace("/","");
  $('#messages'+tempId).append($('<li>').text(name+": "+msg));

 });
});
//File upload event change
$(document).on('change','.fileChoose',function(e){
  var receiverId=this.id;
  var file = e.target.files[0];
  var stream = ss.createStream();

  //Upload a file to the server.
  ss(socket).emit('file', stream, {name:file.name,size: file.size,id:receiverId});
  var blobStream=ss.createBlobReadStream(file);
  var size=0;
  blobStream.on('data',function(chunk){
    size += chunk.length;
    console.log(Math.floor(size / file.size * 100) + '%');
  });
  blobStream.pipe(stream);

  socket.emit('file-download',file.name,receiverId);

});

// Receive File
socket.on('file-download',function(name,fileName,receiverId){
  var a="<a href='/uploads/"+fileName+"'target='_blank'><img src='/images/download-image.png' width='30'>"+fileName+"</a>"
  var tempId=receiverId.replace("#","");
  tempId=tempId.replace("/","");
  $('#messages'+tempId).append($('<li>').html(name+": "+a));

});
