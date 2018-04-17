	//var adresseUrl = 'https://maxime.ws312.net';
  var adresseUrl = 'http://projetchat.com';
  $('.backGrey').css('height',$(window).height().toString()-50+"px");
	$(window).resize(function(){
		$('.backGrey').css('height',$(window).height().toString()-50+"px");
	});
	function validateEmail(email){
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
	}
	$('#btnLog').click(function(){
		$(this).toggleClass('disparait');
		$('#btnReg').toggleClass('disparait');
		$('#connectionAdmin').toggleClass('disparait');
	})
	$('#btnReg').click(function(){
		$(this).toggleClass('disparait');
		$('#btnLog').toggleClass('disparait');
		$('#registrationAdmin').toggleClass('disparait');
	})
	$('#notRegister').click(function(){
		$('#registrationAdmin').toggleClass('disparait');
		$('#connectionAdmin').toggleClass('disparait');
	})
	$('#register').click(function(){
		$('#registrationAdmin').toggleClass('disparait');
		$('#connectionAdmin').toggleClass('disparait');
	})
	$('#btnConnection').click(function(){
		var email = $('input[name=emailco]').val();
		var password = $('input[name=password1co]').val();
		var emailverif = validateEmail(email);
		if(emailverif == true){
			$.ajax({
        url: adresseUrl+'/connection',
        type: 'POST',
        data: 'email=' + email+ '&password='+ password,
        datatype: 'json',
        success: function(retour, statut){
          if(retour === 'mdp'){
            $('#resultError').html('Les identifiants ne correspondent pas.');
          }else{
          	document.cookie = "idadmin="+retour.id+"; expires=Tue, 19 Jan 2038 03:14:07 UTC";
      	    window.location = adresseUrl+"/accueil";
          }
        },
        error: function(objet, statut, error){
          console.log(error);
        }
      });
    }
	})
	// Ajax Inscription //
	$('#btnRegister').click(function(){
		var email = $('input[name=email]').val();
		var password = $('input[name=password1ins]').val();
		var passwordverif = $('input[name=password2ins]').val();
		var name = $('input[name=prenom]').val();
    var role = ($('#selectRole').val() === undefined) ? 'Pending' : $('#selectRole').val();
		var emailverif = validateEmail(email);
		var passwordvalid;
		if(password == passwordverif && password.length >= 6){
			passwordvalid = true;
		}else{
			passwordvalid = false;
		}
		if (passwordvalid == true && emailverif == true){
			$.ajax({
        url: adresseUrl+'/register',
        type: 'POST',
        data: 'email=' + email+ '&password='+ password + '&name=' + name+'&role=' +role,
        datatype: 'json',
        success: function(retour, statut){
          if(retour === 'ok'){
          	window.location = adresseUrl+"/pending";
          }else if(retour === 'email'){
            $('#resultErrorReg').html('L\'email renseigné est déjà utilisé.');
          }
        },
        error: function(objet, statut, error){
          window.location = adresseUrl+"/500";
        }
      });
		}else{
			$('#resultErrorReg').html('Les mots de passe ne correspondent pas ou ils font moins de 6 caractères.');
		}
	}) 
	// Ajax connexion //
	// Mise à jour admin //
	$('#updateAdmin').click(function(e){
		var idadmin = document.cookie.replace(/.*idadmin\=(\w+)\;?.*/, '$1');
		var name = $('input[name=name]').val();
		var email = $('input[name=email]').val();
    $.ajax({
      url: adresseUrl+'/updateAdmin',
      type: 'POST',
      data: 'name=' + name+ '&email='+ email + '&idadmin='+ idadmin,
      datatype: 'json',
      success: function(retour, statut){
        $('#updateAdminResult').append("<span>Les informations ont bien été modfifiées</span>");
      },
      error: function(objet, statut, error){
        console.log(error);
      }
  	});
	})
	$('#updateAdminPassword').click(function(e){
		var idadmin = document.cookie.replace(/.*idadmin\=(\w+)\;?.*/, '$1');
		var password = $('input[name=password]').val();
		var passwordv = $('input[name=passwordv]').val();
		var email = $('input[name=email]').val();
		if(password === passwordv){
      $.ajax({
        url: adresseUrl+'/updateAdminPassword',
        type: 'POST',
        data: 'password=' + password+ '&idadmin='+ idadmin+'&email=' + email,
        datatype: 'json',
        success: function(retour, statut){
          $('#updateadminResultPassword').append("<span>Le mot de passe a bien été modfifié</span>");
        },
        error: function(objet, statut, error){
          console.log(error);
        }
    	});
		}else{
			$('#updateadminResultPasswordError').append("<span>Les deux mot de passe ne correspondent pas</span>");
		}
	})
	// Fin mise à jour admin //
	// Deconnexion //
	$('#disconnection').click(function(){
	    $.ajax({
    		url: adresseUrl+'/disconnection',
    		type: 'GET',
    		success: function(retour, statut){
    			idadmin = document.cookie.replace(/.*idadmin\=(\w+)\;?.*/, '$1');
    			document.cookie = "idadmin="+idadmin+"; expires=Tue, 27 Feb 2018 03:14:07 UTC";
    			window.location = adresseUrl+"/login";
    		},
        error: function(objet, statut, error){
        	console.log("error")
  		}
		})
	})
	// Fin deconnexion //
	// Statut des moderateur //
	$('.typeStatus').click(function(){
		var idadmin = document.cookie.replace(/.*idadmin\=(\w+)\;?.*/, '$1');
		var status = $(this).attr('id');
		$('.typeStatus').toggleClass('disparait');
		$(this).toggleClass('disparait');
		if(status === 'adminstatusOn'){
      var statusAdmin = 'on';
    }else{
      if(status === 'adminstatusOff'){
      }
    }
		$.ajax({
      url: adresseUrl+'/statusAdmin',
      type: 'POST',
      data: 'statut=' + statusAdmin+ '&idadmin='+ idadmin,
      datatype: 'json',
      success: function(retour, statut){
      },
      error: function(objet, statut, error){
          console.log(error);
      }
  	});
  })
	// Fin statut //
	// Affichage menu gauche //
	$('#navLeft').click(function(){
		if($('#leftmenuadmin').offset().left != 0){
			$('#leftmenuadmin').css({left : '0'});
		}else{
			$('#leftmenuadmin').css({left : '-100%'});
		}
	})
	// Partie Sockets //
	// Variables global //
    var name = document.cookie.replace(/.*idadmin\=(\w+)\;?.*/, '$1');
    var adminOnline = [];
    var adminOnlineName = [];
    var sockets = {};
    var socketAdmin = {};
  // Fin des variables global
  // Début de socket //
    var socket = io.connect(adresseUrl+':80');
    //  Emit à la connexion //
    socket.emit('adminConnect', name);
    // Fin emit à la connexion // 
    // On info admin //
    socket.on('push-profileAdmin', function(infos){
      socketAdmin[name] = {name: infos['name'], email: infos['email'], image: infos['image']};
    })
    // fin on info admin //
    // On client/admin connecté //
    socket.on('push-adminInline', function(idOnline, nameOnline){
      adminOnlineName = [];
      adminOnline = [];
      for(var i=0; i < idOnline.length; i++){
        adminOnline.push(idOnline[i]);
        adminOnlineName.push(nameOnline[i]);
      }
      $('li').remove('.liAdminLog');
      if(idOnline != name && nameOnline != socketAdmin[name].name){
        $('.adminLog').prepend("<li class='liAdminLog'>"+nameOnline+"</li>");
      }
    });
    socket.on('push-clientInline', function(name, email, phone, idclient, adresseip, plateform, agent){
      console.log(idclient)
      sockets[idclient] = {name: name, email: email, phone: phone, adresseip: adresseip, plateform: plateform, agent: agent};
    });
    // Fin on client/admin connecté //
    // On nouveau client //
    socket.on('push-newClient', function(){
      if(arguments[0] === 'empty'){
        $('li').remove('.liNewClient');
      }else{
        $('li').remove('.liNewClient');
        for (var i = 0; i <= arguments[0].length -1; i++){
            var t = Date.now() - Date.parse(arguments[0][i]['date']);
            var s = Math.floor(t / 1000) % 60;
            var m = Math.floor(t / 60000) % 60;
            var nb = i + 1;
          $('.newClient').prepend("<li data-newTchatClient="+arguments[0][i]['_idconvers']+" data-clientWaiting="+arguments[0][i]['client']+" class='addNewClient list-group-item liNewClient' >Invité "+nb+"<br/><span class='fontawesome-time'> "+m+":"+s+" minute(s)</li>");
          $('[data-newTchatClient='+arguments[0][i]['_idconvers']+']').click(function(){
            var idClientNow = $(this).attr("data-clientWaiting");
            var idconvers = $(this).attr("data-newTchatClient");
            socket.emit('push-addNewClient', name, idconvers, idClientNow);
            $(this).remove();
            $('.clientNow').prepend("<button type='button' data-idClientNow="+idClientNow+" id='buttonNow"+idconvers+"' data-idconvers='"+idconvers+"' class='addNewClient btn btn-secondary' >Client</button>");
            $('[data-idClientNow='+idClientNow+']').click(function(){
              var idClient = $(this).attr("data-idClientNow");
              var idconvers = $(this).attr("data-idconvers");
              createConvers(idClient, idconvers, name);
            });
          });
        }
      }
    });
    // Fin on nouveau client //
    // on Newconvers // 
    socket.on('push-newConvers', function(idclient, idconvers){
    createConvers(idclient, idconvers, name);
    });
    // Fin on newconvers //
    // Actu convers //
    socket.on('push-conversAdmin', function(idconvers, idclient){
      $('button').remove('.addNewClient');
      for(var i=0; i < idconvers.length; i++){
        $('.clientNow').append("<button type='button' data-idClientNow="+idclient[i]+" id='buttonNow"+idconvers[i]+"' data-idconvers='"+idconvers[i]+"' class='addNewClient btn btn-secondary' >Client</button>");
        $('[data-idClientNow='+idclient[i]+']').click(function(){
          var idClient = $(this).attr("data-idClientNow");
          var idconvers = $(this).attr("data-idconvers");
          createConvers(idClient, idconvers, name);
        });
      }
    })
    // Fin actu convers //
    // Affichage convers de base //
    $('.addNewClient').click(function(){
		// Récupération des informations idclient et admin //
		  var idconvers = $(this).attr("data-newTchatClient");
    	var idClient = $(this).attr("data-idClientNow");
    	createConvers(idClient, idconvers, name);
    });
    // Fin affichage convers de base //
    //  Fonction createConvers //
    function createConvers(idclient, idconvers, idadmin){
      // Vue du t'chat //
      $('#actionAdmin').removeClass('disparait');
      // action new msg //
      $("span").remove("#idNoSeen"+idconvers);
      $('#buttonNow'+idconvers).removeClass('newMsgClient');
      // Action conversation en cours //
      $('.addNewClient').removeClass('conversInNow');
      $('#buttonNow'+idconvers).addClass('conversInNow');
      $('div').remove('.globalTchat');
      $('div').remove('.infosClientAction');
      $("<div class='globalTchat'><div class='p-2 blocTchat bg-white border'><ul class='blocMsgAdmin' id='"+idconvers+"'></ul></div><div class='text-center text-success resultMsg'></div><div class='text-center text-danger resultMsgError'></div><textarea class='content' id='sendadmin'></textarea></div>").prependTo('.unitTchat');
      if(typeof sockets[idclient] === 'undefined'){
        $("<div class='infosClientAction'><p>Erreur 500, ce contenu n'a pas pu être chargé</p></div>").appendTo('.unitAction');
      }else{
        $("<div class='infosClientAction'><div class='resultInfos text-center text-success'></div><div class='mt-2 p-2'><img src='imgbase.png' class='float-left'><input type='text' name='name' value='"+sockets[idclient].name+"' placeholder='Ajouter un nom' class='mb-2 w-75 p-2 rounded updateClientInput'><input type='email' name='email' value='"+sockets[idclient].email+"' placeholder='Ajouter un e-mail' class='mb-2 w-75 p-2 rounded updateClientInput'><input type='text' name='phone' value='"+sockets[idclient].phone+"' placeholder='Ajouter un numéro' class='mb-2 w-100 p-2 rounded updateClientInput'><h3>Commentaire</h3><textarea class='w-100 mb-2 rounded' placeholder='Ajouter un commentaire' id='textareaComment'></textarea><button id='addComment'>Ajouter</button></div><div class='p-2'><h4>Chemin du visiteur</h4><div class='divPathClient mb-2'><ul class='pathClient'></ul></div><div class='row subBeforDivPathClient'><div class='col-4 subDivPathClient' id='firstConversClient'></div><div class='col-4 subDivPathClient' id='numberChatClient'></div><div class='col-4 subDivPathClient' id='timeConversNow'></div></div><div class='globalhisto disparait'><h3>Historique</h3><div class='tabhisto'><small><table class='table'><thead><tr><th scope='col'>Agent</th><th scope='col'>Satisfaction</th><th scope='col'>Jour</th><th scope='col'>Message</th></tr></thead><tbody class='histoadd'></tbody></table></small></div></div><h3>Informations complémentaire</h3><small><div class='border p-2'><span class='font-weight-bold'>Plateforme:</span><br/>"+sockets[idclient].plateform+"<br/><span class='font-weight-bold'>Adresse IP:</span><br/>"+sockets[idclient].adresseip+"<br/><span class='font-weight-bold'>Agent utilisateur:</span><br/>"+sockets[idclient].agent+"</div></small></div></div>").appendTo('.unitAction');
      }
      // Information client //
      $('.updateClientInput').click(function(){
        $(".resultInfos").html("");
        $(this).keypress(function(e){
          if (e.which == 13){
          var nominput = $(this).attr('name');
          var infos = $('input[name='+nominput+']').val();
            $.ajax({
              url: adresseUrl+'/updateClient',
              type: 'POST',
              data: 'name=' + nominput+ '&infos='+ infos+ '&client='+ idclient,
              datatype: 'json',
              success: function(retour, statut){
                if(retour === 'ok'){
                  $(".resultInfos").html("L'information est bien enregistrée");
                }else if(retour === 'no-ok'){
                  $(".resultInfos").html("L'information n'as pas pu être enregistrée");
                }
              },
              error: function(objet, statut, error){
                console.log(error);
              }
            });
          }
        })
      })
      // Ajout de commentaire //
      $('#addComment').click(function(){
        var content = $('#textareaComment').val();
        $.ajax({
          url: adresseUrl+'/addCommentaire',
          type: 'POST',
          data: 'commentaire=' + content+ '&idconvers='+ idconvers,
          datatype: 'json',
          success: function(retour, statut){
            $(".resultInfos").html("Commentaire ajouté");
            $('#textareaComment').val('');
          },
          error: function(objet, statut, error){
            console.log(error);
          }
        });
      })
      // Chargement ancien message //
      $.ajax({
        url: adresseUrl+'/actuAdmin',
        type: 'POST',
        data: 'idconvers='+ idconvers+'&idadmin='+idadmin,
        datatype: 'json',
        success: function(retour, statut){
          for (var i = 0; i < retour['message'].length ; i++){
            var datemsg = new Date(retour['message'][i]['date']);
            var heuremsg = datemsg.getHours();
            var minutemsg = datemsg.getMinutes();
            if(retour['message'][i]['type'] === 'message'){
              if (retour['message'][i]['auteur'] == name){
                $('.blocMsgAdmin').append("<li class='adminTchatAdmin'><span class='spanTime'>"+heuremsg+"h"+minutemsg+"</span><p><span class='font-weight-bold'>"+retour['nameadmin']+"</span><br/>"+retour['message'][i]['message']+"</p><img src='"+retour['image']+"' class='rounded-circle' width='5%'></li>");
              }else{
                if(typeof sockets[idclient] === 'undefined'){
                  $('.blocMsgAdmin').append("<li class='adminTchatClient'><img src='imgbase.png' class='rounded-circle' width='5%'><p><span class='font-weight-bold'>Client</span><br/>"+retour['message'][i]['message']+"</p><span class='spanTime'>"+heuremsg+"h"+minutemsg+"</span></li>");
                }else{
                  $('.blocMsgAdmin').append("<li class='adminTchatClient'><img src='imgbase.png' class='rounded-circle' width='5%'><p><span class='font-weight-bold'>"+sockets[idclient].name+"</span><br/>"+retour['message'][i]['message']+"</p><span class='spanTime'>"+heuremsg+"h"+minutemsg+"</span></li>");
                }
              }
            }else if(retour['message'][i]['type'] === 'comment'){
              $('.blocMsgAdmin').append("<li class='commentInTchat'>"+retour['message'][i]['message']+"</li>");
            }else{
              $('.blocMsgAdmin').append("<li class='logInTchatAdmin'>"+retour['message'][i]['message']+"</li>");
            }
          }
          $('.blocMsgAdmin').animate({scrollTop: $('.blocMsgAdmin').position().top += 1000000}, 100);
        },
        error: function(objet, statut, error){
            console.log("erreur");
        }
      });
      // Recherche historique client //
      $.ajax({
        url: adresseUrl+'/searchLastConvers',
        type: 'POST',
        data: 'idclient='+ idclient,
        datatype: 'json',
        success: function(retour, statut){
          if(retour != 'no'){
            for(var i=0; i < retour.length; i++){
              var datemsg = new Date(retour[i]['date']);
              var jourmsg = datemsg.getDate();
              var moismsg = datemsg.getMonth() + 1;
              var annemsg = datemsg.getFullYear();
              $('.histoadd').append("<tr><td scope='row' title='Historique' data-client='"+retour[i]['client']+"' data-convers='"+retour[i]['_idconvers']+"' onclick='tchathistory(this)' ><a href='#'>"+retour[i]['nameidadmin']+"</a></td><td class='text-center'>"+retour[i]['note']+"</td><td>"+jourmsg+"/"+moismsg+"/"+annemsg+"</td><td class='text-center'><span class='badge badge-secondary'>"+retour[i]['nbmessage']+"</span></td></tr>");
            }
          }               
        },
        error: function(objet, statut, error){
            console.log("erreur");
        }
      });
      // Chemin du client //
      $.ajax({
        url: adresseUrl+'/pathClient',
        type: 'POST',
        data: 'idclient='+ idclient,
        datatype: 'json',
        success: function(retour, statut){
          for(var i=0; i <retour.length; i++){
            $('.pathClient').prepend('<li>'+retour[i]+'</li>')
          }        
        },
        error: function(objet, statut, error){
            console.log("erreur");
        }
      });
      // Statistique du client //
      $.ajax({
        url: adresseUrl+'/statsClient',
        type: 'POST',
        data: 'idclient='+ idclient+'&idconvers='+ idconvers,
        datatype: 'json',
        success: function(retour, statut){
          var datemsg = new Date(retour['firstConvers']);
          var jourmsg = datemsg.getDate();
          var moismsg = datemsg.getMonth() + 1;
          var annemsg = datemsg.getFullYear();
          var t = Date.now() - Date.parse(retour['firstMsg']);
          var m = Math.floor(t / 60000) % 60;
          $('#firstConversClient').append("<p class='text-center'>"+jourmsg+"/"+moismsg+"/"+annemsg+"</p>");
          $('#numberChatClient').append("<p class='text-center' onclick='displayhisto()' >"+retour['nbconvers']+"</p>");
          $('#timeConversNow').append("<p class='text-center'>"+m+" Min</p>");
        },
        error: function(objet, statut, error){
            console.log("erreur");
        }
      });
      $('#sendadmin').click(function(e){
        var nbKey = 0
        $(this).keypress(function(e){
          nbKey++;
          if (e.which == 13){
            var message = $(this).val();
            var regexFirstChar = new RegExp('^[a-zA-Z0-9_]');
            var testMessage = regexFirstChar.test(message);
            if(message.length > 2 && testMessage === true){
                $.ajax({
                  url: adresseUrl+'/insertAdmin',
                  type: 'POST',
                  data: 'message=' + message+ '&idconvers='+ idconvers + '&adminid=' + idadmin,
                  datatype: 'json',
                  success: function(retour, statut){
                    $(".resultMsg").html("Le message a bien été envoyé");
                    $(".content").val('');
                  },
                  error: function(objet, statut, error){
                    $(".resultMsgError").html("Le message n'a pas pu être envoyé");
                  }
              });
            }else{
              $(".resultMsgError").html("Le message est trop court");
            }
          }else{
            if(nbKey === 2){
              socket.emit('adminWrite', idconvers, idclient);
            }
          }
        })
      })
      $('#sendadmin').blur(function(){
        socket.emit('adminEndWrite', idconvers, idclient);
      })
    }
    // Fin fonctions createConvers //

    // Ecriture des messages //
    socket.on('push-adminMessage', function(messageBDD){
      var nbNewMsg = 0;
      for(var j = 0; j <= messageBDD.length -1; j++){
        var datemsg = new Date(messageBDD[j]['date']);
        var heuremsg = datemsg.getHours();
        var minutemsg = datemsg.getMinutes();
        if(messageBDD[j]['type'] === 'message'){
          // Ici calcul des new msg //
          if(messageBDD[j]['seen'] === 'no'){
            nbNewMsg++;
          }
          if(nbNewMsg != 0){
          $("span").remove("#idNoSeen"+messageBDD[j]['_idconvers']);
          $('#buttonNow'+messageBDD[j]['_idconvers']).append("<span class='nbNoSeen badge badge-pill badge-warning ml-2' id='idNoSeen"+messageBDD[j]['_idconvers']+"' > "+nbNewMsg+"</span>");
          $('#buttonNow'+messageBDD[j]['_idconvers']).addClass('newMsgClient');
          }
          if(messageBDD[j]['auteur'] == name){
            $("#"+messageBDD[j]['_idconvers']).append("<li class='adminTchatAdmin'><span class='spanTime'>"+heuremsg+"h"+minutemsg+"</span><p><span class='font-weight-bold'>"+socketAdmin[name].name+"</span><br/>"+messageBDD[j]['message']+"</p><img src='"+socketAdmin[name].image+"' class='rounded-circle' width='5%'></li>");
          }else{
            if(sockets[messageBDD[j]['auteur']] != undefined){
                $("#"+messageBDD[j]['_idconvers']).append("<li class='adminTchatClient'><img src='imgbase.png' class='rounded-circle' width='5%'><p><span class='font-weight-bold'>"+sockets[messageBDD[j]['auteur']].name+"</span><br/>"+messageBDD[j]['message']+"</p><span class='spanTime'>"+heuremsg+"h"+minutemsg+"</span></li>");
            }else{
              $("#"+messageBDD[j]['_idconvers']).append("<li class='adminTchatClient'><img src='imgbase.png' class='rounded-circle' width='5%'><p><span class='font-weight-bold'>Visiteur</span><br/>"+messageBDD[j]['message']+"</p><span class='spanTime'>"+heuremsg+"h"+minutemsg+"</span></li>");
            }
          }
        }else if(messageBDD[j]['type'] === 'comment'){
          $("#"+messageBDD[j]['_idconvers']).append("<li class='commentInTchat'>"+messageBDD[j]['message']+"</li>");
        }else{
          $("#"+messageBDD[j]['_idconvers']).append("<li class='logInTchatAdmin'>"+messageBDD[j]['message']+"</li>");
        }
      }
    });
    // Fin écriture des messages //
  // Fin de socket //
  function endConvers(id){
    var idendconvers = $(id).attr('data-endConvers');
    $.ajax({
      url: adresseUrl+'/archivconvers',
      type: 'POST',
      data: 'idconvers='+ idendconvers+'&idadmin='+name,
      datatype: 'json',
      success: function(retour, statut){
          $('div').remove('.globalTchat');
          $('div').remove('.infosClientAction');
          $('button').remove("#buttonNow"+idendconvers);
      },
      error: function(objet, statut, error){
          console.log(error)
      }
    });
  }
  // Fin fonction fin de convers //
  // Action admin //
  $('#actionAdmin').change(function(){
    if($(this).val() === 'trans'){
      transfertConvers();
    }else if($(this).val() === 'info'){
      $('.infosClientAction').removeClass('disparait');
      $('div').remove('.transferClient');
      $('div').remove('.inviteAdmin');
    }else if($(this).val() === 'inv'){
      inviteConves();
    }
  })
  function transfertConvers(){
    $('.infosClientAction').addClass('disparait');
    $('div').remove('.inviteAdmin');
    $("<div class='transferClient p-2'><label>Raison du tranfert:</label><select class='custom-select transSelect'><option value='1' selected>Ma journée est fini.</option><option value='2'>Je ne sais pas comment répondre à sa question.</option><option value='3'>Le client veut parler à un responsable.</option><option value='4'>Le client est insultant.</option></select><p>Transférer à quel modérateur:</p><ul id='transferAdminLog'></ul></div>").appendTo('.unitAction');
    for(var i=0; i < adminOnlineName.length; i++){
      if(adminOnline[i] != name){
        $("<li class='liTransferConvers' data-admin='"+adminOnline[i]+"'><a href='#'>"+adminOnlineName[i]+"</a></li>").appendTo('#transferAdminLog');
      }
    }
    $('.liTransferConvers').click(function(){
      var nameclient = $(this).attr('data-admin');
      var idconvers = $('.blocMsgAdmin').attr('id');
      var messageTransfert = $('.transSelect option:selected').text();
      $.ajax({
        url: adresseUrl+'/transferConvers',
        type: 'POST',
        data: 'nameclient='+ nameclient+ '&idconvers='+idconvers+'&comment='+messageTransfert+'&idadminNow='+name,
        datatype: 'json',
        success: function(retour, statut){
          $('div').remove('.globalTchat');
          $('div').remove('.infosClientAction');
          $('div').remove('.transferClient');
          $('#actionAdmin').addClass('disparait');
        },
        error: function(objet, statut, error){
          console.log(error)
        }
      });
    })
  }
  function inviteConves(){
    $('.infosClientAction').addClass('disparait');
    $('div').remove('.transferClient');
    $("<div class='inviteAdmin p-2'><p>Inviter quel opérateur</p><ul id='inviteAdmin'></ul></div>").appendTo('.unitAction');
    for(var i=0; i < adminOnlineName.length; i++){
      if(adminOnline[i] != name){
        $("<li class='liInviteConvers' data-admin='"+adminOnline[i]+"'><a href='#'>"+adminOnlineName[i]+"</a></li>").appendTo('#inviteAdmin');
      }
    }
  }
  // fin action admin // 
  // tchathistory //
  function tchathistory(id){
    var idconvers = $(id).attr('data-convers');
    var client = $(id).attr('data-client');
    $.ajax({
      url: adresseUrl+'/tchatHistory',
      type: 'POST',
      data: 'idclient='+client +'&idadmin=' +name +'&idconvers='+idconvers,
      datatype: 'json',
      success: function(retour, statut){
        windowhistory();
        $('.windowHistory').removeClass('disparait');
        $('ul').remove('.ulWindow');
        $('li').remove('.liWindow');
        $('h4').remove('.h4Window');
      },
      error: function(objet, statut, error){
          console.log(error)
      }
    });
  }
  $('#windowClose').click(function(){
    $('.windowHistory').addClass('disparait');
  })
  function windowhistory(){
    $(document.body).click(function(e){
        var histo = $('.windowHistory');
        if(!$(e.target).is(histo)&&!$.contains(histo[0],e.target)) {
            $('.windowHistory').addClass('disparait');
        }
    });
  }
  socket.on('push-history', function(messageBDD, idconvers){
    var auteur = messageBDD[0]['auteur'];
    var datemsg = new Date(messageBDD[0]['date']);
    var jourmsg = datemsg.getDate();
    var moismsg = datemsg.getMonth() + 1;
    var annemsg = datemsg.getFullYear();
    var heuremsg = datemsg.getHours();
    var minutemsg = datemsg.getMinutes();
    $('.divHistoPop').prepend("<h4 id='#histid"+messageBDD[0]['_idconvers']+"' class='h4Window mt-2'>Date: "+jourmsg+"/"+moismsg+"/"+annemsg+" à "+heuremsg+":"+minutemsg+"</h4><ul class='ulWindow' id='"+messageBDD[0]['_idconvers']+"'></ul>");
    for(var i=0; i<messageBDD.length; i++){
      if(messageBDD[i]['type'] === 'log' || messageBDD[i]['type'] ==='logP'){
        $('#'+messageBDD[i]['_idconvers']).prepend("<li class='liWindow logInTchatAdmin'>"+messageBDD[i]['message']+"</li>");
      }else if(messageBDD[i]['type'] === 'comment'){
        $('#'+messageBDD[i]['_idconvers']).prepend("<li class='liWindow commentInTchat'>Commentaire: "+messageBDD[i]['message']+"</li>");
      }else{
        if(messageBDD[i]['auteur'] === auteur){
          $('#'+messageBDD[i]['_idconvers']).prepend("<li class='liWindow typeMessageC'>Client: "+messageBDD[i]['message']+"</li>");
        }else{
          $('#'+messageBDD[i]['_idconvers']).prepend("<li class='liWindow typeMessage'>Opérateur: "+messageBDD[i]['message']+"</li>");
        }
      }
    }
  })
  // Fin tchathistory //
  // Client Write //
  socket.on('push-clientWriteForAdmin', function(idconvers){
    $('#buttonNow'+idconvers).append(" <span class='fontawesome-pencil clientWrite"+idconvers+"'></span>");
  })
  socket.on('push-clientEndWriteForAdmin', function(idconvers){
    $('span').remove(".clientWrite"+idconvers);
  })
  // fin client Write //
  // Status chargement de page //
  setTimeout(function(){
    if(adminOnline.indexOf(name) === 0){
      $('#adminstatusOff').addClass('disparait');
      $('#adminstatusBreak').addClass('disparait');
      $('#adminstatusOn').removeClass('disparait');
    }else{
      $('#adminstatusOn').addClass('disparait');
      $('#adminstatusBreak').addClass('disparait');
      $('#adminstatusOff').removeClass('disparait');
    }
  }, 1500);
  //  Fin status chargement de page //
  function displayhisto(){
    $('.globalhisto').toggleClass('disparait');
  }