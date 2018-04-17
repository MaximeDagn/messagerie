  var idClient;
  var idConvers;
  var socketAdmin = {};
  var socket = io.connect('https://maxime.ws312.net:443');
  if(document.cookie.indexOf('idClient') ===-1) {
    $.ajax({
      url: 'https://maxime.ws312.net/createUser',
      type: 'GET',
      success: function(retour, statut){
        idClient = retour;
        document.cookie = "idClient="+idClient+"; expires=Tue, 19 Jan 2038 03:14:07 UTC";
        checkConvers();
      },
      error: function(objet, statut, error){
        $('.blocTchatUl').append("<li class='logInTchat' >"+messageBdd[i]['message']+"</li>");
      }
    });
  }else{
    idClient = document.cookie.replace(/.*idClient\=(\w+)\;?.*/, '$1');
    $.ajax({
      url: 'https://maxime.ws312.net/recoveUser',
      type: 'POST',
      data: 'idclient=' + idClient,
      datatype: 'json',
      success: function(retour, statut){
        if(retour['result'] === 'change'){
          idClient = retour['idclient'];
          document.cookie = "idClient="+idClient+"; expires=Tue, 19 Jan 2038 03:14:07 UTC";
          idConvers = getUniqueID();
          document.cookie = "idConvers="+idConvers+"; expires=Tue, 19 Jan 2038 03:14:07 UTC";
          goEmit();
        }else if(retour['result'] === 'keep'){
          idClient = retour['idclient'];
          document.cookie = "idClient="+idClient+"; expires=Tue, 19 Jan 2038 03:14:07 UTC";
          checkConvers();
        }
      },
      error: function(objet, statut, error){
        $('.blocTchatUl').append("<li class='logInTchat' >"+messageBdd[i]['message']+"</li>");
      }
    });
  }
  $('.chatmodal').click(function(){
    $('#modalchat').toggleClass('disparait');
    $('#chatmodal').toggleClass('disparait');
    $('.blocTchatUl').animate({scrollTop: $('.blocTchatUl').position().top += 1000}, 1500);
  })

  function goEmit(){
    socket.emit('lastId', idClient, idConvers);
    var urlclient = window.location.href;
    socket.emit('urlclient', idClient, urlclient);
    $.ajax({
        url: 'https://maxime.ws312.net/adminOfClient',
        type: 'POST',
        data: 'idconvers='+ idConvers,
        datatype: 'json',
        success: function(retour, statut){
          $('div').remove('.headerLoad');
          if(retour == 'null'){
            $("#headerModalTchatDown").append("<div class='headerLoad' ><img src='https://maxime.ws312.net/imgbase.png'><span>Pas défini</span></div>");
          }else{
            socketAdmin[retour['idadmin']] = {name: retour['name'], image: retour['image']};
            $('#modalchat').toggleClass('disparait');
            $('#chatmodal').toggleClass('disparait');
            $("#headerModalTchatDown").append("<div class='headerLoad' ><img src='https://maxime.ws312.net/"+retour['image']+"'><span>"+retour['name']+"</span><span data-note='fontawesome-thumbs-up' class='fontawesome-thumbs-up noteAdmin' id='thumbsUp'></span><span data-note='fontawesome-thumbs-down' class='fontawesome-thumbs-down noteAdmin' id='thumbsDown'></span></div>");
            $('.noteAdmin').click(function(){
              var note = $(this).attr('data-note');
              noteAdmin(note);
            })
          }
        },
        error: function(objet, statut, error){
            $('.blocTchatUl').append("<li class='logInTchat' >"+messageBdd[i]['message']+"</li>");
        }
    });
  }
  socket.on('push-message', function(messageBdd){
    recoverDataClient()
    for(var i = 0; i <= messageBdd.length -1; i++){
      if(messageBdd[i]['_idconvers'] == idConvers){
        if(messageBdd[i]['type'] === 'message'){
          if(messageBdd[i]['auteur'] != idClient){
            if(typeof socketAdmin[messageBdd[i]['auteur']] == 'undefined'){
              $('.blocTchatUl').append('<div class="liChatAdmin"><img src="https://maxime.ws312.net/operateur.png" class="imgTchat"><li>'+messageBdd[i]['message']+' </li></div>');
            }else{
              $('.blocTchatUl').append('<div class="liChatAdmin"><img src=https://maxime.ws312.net/'+socketAdmin[messageBdd[i]['auteur']].image+' class="imgTchat"><li>'+messageBdd[i]['message']+' </li></div>');
            }
          }else{
            $('.blocTchatUl').append('<div class="liChatClient"><li>'+messageBdd[i]['message']+' </li><img src="https://maxime.ws312.net/imgbase.png" class="imgTchat"></div>');
          }
        }else{
          if(messageBdd[i]['type'] === 'logP'){
            $('.blocTchatUl').append("<li class='logInTchat' >"+messageBdd[i]['message']+"</li>");
          }
        }
      }
    }
    $('.blocTchatUl').animate({scrollTop: $('.blocTchatUl').position().top += 1000}, 1500);
  });
  socket.on('push-NewAdmin', function(src, userName, idadmin){
    $('div').remove('.headerLoad');
    if(typeof socketAdmin[idadmin] == 'undefined'){
      socketAdmin[idadmin] = {name: userName, image: src};
    }
    $("#headerModalTchatDown").append("<div class='headerLoad' ><img src='https://maxime.ws312.net/"+src+"'><span>"+userName+"</span><span data-note='fontawesome-thumbs-up' class='fontawesome-thumbs-up noteAdmin' id='thumbsUp'></span><span data-note='fontawesome-thumbs-down' class='fontawesome-thumbs-down noteAdmin' id='thumbsDown'></span></div>");
    $('.noteAdmin').click(function(){
      var note = $(this).attr('data-note');
      noteAdmin(note);
    })
  })
  // Récupération infos du client //
  function recoverDataClient(){
    $.getJSON("https://api.ipify.org?format=jsonp&callback=?",
      function(json){
        var allName = ['adresseip', 'plateform', 'agent'];
        var allInfos = [json.ip, navigator.platform, navigator.userAgent];
        for(var i=0; i < allInfos.length; i++){
          $.ajax({
            url: 'https://maxime.ws312.net/updateClientConvers',
            type: 'POST',
            data: 'name=' + allName[i]+ '&infos='+ allInfos[i]+ '&idconvers='+ idConvers,
            datatype: 'json',
            success: function(retour, statut){
            },
            error: function(objet, statut, error){
              console.log(error);
            }
          });
        }
      }
    );
  }
  // Fin récupèreration infos du client //
  // Création idconvers //
  function checkConvers(){
    if(document.cookie.indexOf('idConvers') ===-1) {
          idConvers = getUniqueID();
          document.cookie = "idConvers="+idConvers+"; expires=Tue, 19 Jan 2038 03:14:07 UTC";
          goEmit();
      }else {
          var checkConvers = document.cookie.replace(/.*idConvers\=(\w+)\;?.*/, '$1');
          $.ajax({
            url: 'https://maxime.ws312.net/checkConvers',
            type: 'POST',
            data: 'checkConvers='+ checkConvers,
            datatype: 'json',
            success: function(retour, statut){
              if(retour === 'change'){
                idConvers = getUniqueID();
                document.cookie = "idConvers="+idConvers+"; expires=Tue, 19 Jan 2038 03:14:07 UTC";
                goEmit();
              }else{
                idConvers = checkConvers;
                goEmit();
              }
            },
            error: function(objet, statut, error){
              $('.blocTchatUl').append("<li class='logInTchat' >Service momentanément indisponible</li>");
            }
          });
      }
  }
  function getUniqueID(){ 
      var uniqueID = new Date();
      var date = uniqueID.getTime();
      var returnMake = makeid();
      return date +''+ returnMake;
  }
  function makeid(){
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for (var i = 0; i < 15; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
      return text;
  }
  // Note admin //
  function noteAdmin(note){
    if(note === 'fontawesome-thumbs-down'){
      var noteAdmin = "<span class='fontawesome-thumbs-down text-danger'></span>";
    }else{
      var noteAdmin = "<span class='fontawesome-thumbs-up text-success'></span>";
    }
    $.ajax({
      url: 'https://maxime.ws312.net/updateNote',
      type: 'POST',
      data: 'note=' + noteAdmin+ '&convers='+ idConvers,
      datatype: 'json',
      success: function(retour, statut){
        $("#result").html("Votre appréciation est bien enregistrée");
      },
      error: function(objet, statut, error){
        $("#resultError").html("Un problème est survenu, l'appréciation n'a pas été effectuée.");
      }
    });
  }
  // Fin note //
    // Envoi des message pour l'utilisateur // 
  $('#content').click(function(){
    var nbKey = 0;
    $(this).keypress(function(e){
      nbKey++;
      if (e.which == 13){
        var message = $(this).val();
        var regexFirstChar = new RegExp('^[a-zA-Z0-9_]');
        var testMessage = regexFirstChar.test(message);
        if(message.length > 2 && testMessage === true){
          $.ajax({
            url: 'https://maxime.ws312.net/insert',
            type: 'POST',
            data: 'message=' + message+ '&idClient='+ idClient + '&idconvers=' + idConvers,
            datatype: 'json',
            success: function(retour, statut){
              $("#result").html("Le message a bien été envoyé");
              document.getElementById("content").value = "";
            },
            error: function(objet, statut, error){
              $("#resultError").html("Le message n'a pas pu être envoyé");
            }
          });
        }else {
          $("#resultError").html("Le message est trop court");
        }
      }else{
        if(nbKey === 2){
          socket.emit('clientWrite', idConvers);
        }
      }
    })
  })
  $('#content').blur(function(){
    socket.emit('clientEndWrite', idConvers);
  })
  socket.on('push-adminWriteForClient', function(idconvers){
    var text = "Votre interlocuteur est entrain d'écrire";
    $('#otherResult').append("<span class='adminWrite' >Votre interlocuteur est entrain d'écrire</span>");
  })
  socket.on('push-adminEndWriteForClient', function(idconvers){
    $('span').remove('.adminWrite');
  })
  $(this).keypress(function(e){
    console.log(e)
  })