$(document).ready(function(){

	$.ajax({
		url: 'https://maxime.ws312.net/recoveListeAdmin',
		type: 'GET',
		datatype: 'json',
		success: function(retour, statut){
			for(var i=0; i<retour.length; i++){
				$('#listadmin').append("<tr><td>"+retour[i]['idadmin']+"</td><td>"+retour[i]['email']+"</td><td>"+retour[i]['name']+"</td><td>"+retour[i]['role']+"</td><td>"+retour[i]['image']+"</td><td><button data-email='"+retour[i]['email']+"' id='"+retour[i]['idadmin']+"' class='btn btn-secondary editAdmin'>Modifier</button></td><td class='text-center'><span id='"+retour[i]['idadmin']+"' class='fontawesome-trash removeAdmin'></span></td></tr>")
			}
		    $('.editAdmin').click(function(){
		  		var idadmin = $(this).attr('id');
		  		var email = $(this).attr('data-email');
		  		editAdmin(idadmin, email);
		    })
		    $('.removeAdmin').click(function(){
    			if(confirm("Voulez vous vraiment supprimé cet modérateur")){
			  		var idadmin = $(this).attr('id');
			  		removeAdmin(idadmin);
				}
		    })
		},
		error: function(objet, statut, error){
		  alert('La liste des opérateur n\' pas pu être chargé!');
		}
	});
    function removeAdmin(idadmin){
    	$.ajax({
			url: 'https://maxime.ws312.net/removeAdmin',
			type: 'POST',
			data: 'idadmin='+idadmin,
			datatype: 'json',
			success: function(retour, statut){
				if(retour === 'ok'){
					location.reload();
				}else{
					alert('Le compte n\'a pas pu être supprimé');
				}
			},
			error: function(objet, statut, error){
				alert('Le compte n\'a pas pu être supprimé');
			}
    	});
    }
    function editAdmin(idadmin, email){
    	$('#editAdminForm').empty().removeClass('disparait');
    	$('#editAdminForm').append("<div class='form-group'><label for='exampleFormControlSelect1'>Nouveau rôle de "+email+"</label><select class='form-control' id='selectRoleEdit'><option value='operateur'>Opérateur</option><option value='administrateur'>Administrateur</option></select></div><button type='button' class='btn btn-primary' data-idadmin='"+idadmin+"' id='btnUpdateAdmin'>Modifier</button>");
    	$('#btnUpdateAdmin').click(function(){
    		var role = $('#selectRoleEdit').val();
	    	$.ajax({
				url: 'https://maxime.ws312.net/editAdmin',
				type: 'POST',
				data: 'idadmin='+idadmin+'&role='+role,
				datatype: 'json',
				success: function(retour, statut){
					if(retour === 'ok'){
						location.reload();
					}
				},
				error: function(objet, statut, error){
					alert('Le grade n\'a pas pu être mis à jour');
				}
    		});
    	})
    }


  // Création compte admin //
    $('#addAdmin').click(function(){
  		$('#loginadmin').removeClass('disparait');
    })
	$(document.body).click(function(e){
	    var insert = $('#loginadmin');
		var insertTwo = $('#addAdmin');
		var updateAdmin = $('#editAdminForm');
		var updateAdminTwo = $('.editAdmin');
	    if(!$(e.target).is(insert&&insertTwo)&&!$.contains(insert[0],e.target)){
	        $('#loginadmin').addClass('disparait');
	    }
	    if(!$(e.target).is(updateAdmin&&updateAdminTwo)&&!$.contains(updateAdmin[0],e.target)){
	        $('#editAdminForm').addClass('disparait');
	    }
	});

});