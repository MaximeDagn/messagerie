$(document).ready(function(){

var idadmin = document.cookie.replace(/.*idadmin\=(\w+)\;?.*/, '$1');
// Appel des graphique //
$('#graphDay').click(function(){
  var date = 2;
  goGraphStat(date);
  goGraphNote(date);
  goGraphStatDeux(date);
})
$('#graphWeek').click(function(){
  var date = 7;
  goGraphStat(date);
  goGraphNote(date);
  goGraphStatDeux(date);
})
$('#graphMonth').click(function(){
  var date = 31;
  goGraphStat(date);
  goGraphNote(date);
  goGraphStatDeux(date);
})

// Appel des infos Ajax //
function goGraphNote(date){
  $.ajax({
    url: 'http://projetchat.com/dashboardNote',
    type: 'POST',
    data: 'idadmin=' + idadmin+ '&date='+ date,
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
      var labels = ['Satisfait', 'Non noté', 'Insatisfait'];
      var data = [good, noNote, bad];
      graphicNote(labels, data);
    },
    error: function(objet, statut, error){
      console.log(error);
    }
  });
}
function goGraphStat(date){
  $.ajax({
    url: 'http://projetchat.com/dashboardConvers',
    type: 'POST',
    data: 'idadmin=' + idadmin+ '&date='+ date,
    datatype: 'json',
    success: function(retour, statut){
      var labels = ['Nombre de conversation', 'Nombre de message', 'Moyenne de message / conversation'];
      var data = [retour['nbconvers'], retour['nbmessage'], retour['nbaverageMsg']];
      graphicStat(labels, data);
    },
    error: function(objet, statut, error){
      console.log(error);
    }
  });
}
function goGraphStatDeux(date){
  $.ajax({
    url: 'http://projetchat.com/dashboardConversDeux',
    type: 'POST',
    data: 'idadmin=' + idadmin+ '&date='+ date,
    datatype: 'json',
    success: function(retour, statut){
      var totalTemps = 0;
      for(var i=0; i<retour['infosconvers'].length; i++){
        var temps = Date.parse(retour['datefirst'][i]) - Date.parse(retour['infosconvers'][i]['date']);
        var m = Math.floor(temps / 60000) % 60;
        totalTemps += m;
      }
      var tempsConvers = Math.floor(totalTemps / retour['infosconvers'].length);
      var labels = ['Temps total en conversation', 'Temps moyen / conversation'];
      var data = [totalTemps, tempsConvers];
      graphicStatDeux(labels, data);
    },
    error: function(objet, statut, error){
      console.log(error);
    }
  });
}
// Lancement de toutes les fonctions au chargement de la page //
$('#graphDay').first().trigger('click');
});