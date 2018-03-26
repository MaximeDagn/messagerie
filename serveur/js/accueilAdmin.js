$(document).ready(function(){

var idadmin = document.cookie.replace(/.*idadmin\=(\w+)\;?.*/, '$1');
// Appel des graphique //
$('#graphDay').click(function(){
  goGraphStat();
})

// Appel des infos Ajax //
function goGraphStat(){
  $.ajax({
    url: 'https://maxime.ws312.net/dashboardConvers',
    type: 'POST',
    data: 'idadmin=' + idadmin,
    datatype: 'json',
    success: function(retour, statut){
      var nbconvers = retour['nbconvers'];
      var nbmessage = retour['nbmessage'];
      $('#nbConvers').html(nbconvers+" conversations effectuées");
      $('#nbMessage').html(nbmessage+" messages échangés");
    },
    error: function(objet, statut, error){
      console.log(error);
    }
  });
  $.ajax({
    url: 'https://maxime.ws312.net/dashboardNote',
    type: 'POST',
    data: 'idadmin=' + idadmin,
    datatype: 'json',
    success: function(retour, statut){
      var good = 0;
      var bad = 0;
      var noNote = 0;
      for(var i=0; i<retour.length; i++){
        if(retour[i]['note'] === "<span class='fontawesome-thumbs-down text-danger'></span>"){
          bad ++;
        }else if((retour[i]['note'] === "<span class='fontawesome-thumbs-up text-success'></span>")){
          good++;
        }else{
          noNote++;
        }
      }  
      $('#nbNote').html(good+" clients satisfait");
    },
    error: function(objet, statut, error){
      console.log(error);
    }
  });
    $.ajax({
    url: 'https://maxime.ws312.net/dashboardConversDeux',
    type: 'POST',
    data: 'idadmin=' + idadmin,
    datatype: 'json',
    success: function(retour, statut){
      var totalTemps = 0;
      for(var i=0; i<retour['infosconvers'].length; i++){
        var temps = Date.parse(retour['datefirst'][i]) - Date.parse(retour['infosconvers'][i]['date']);
        var m = Math.floor(temps / 60000) % 60;
        totalTemps += m;
      }
      $('#nbMinutes').html(totalTemps+" minutes passées en conversation");
    },
    error: function(objet, statut, error){
      console.log(error);
    }
  });
}

// Lancement de toutes les fonctions au chargement de la page //
$('#graphDay').first().trigger('click');
});