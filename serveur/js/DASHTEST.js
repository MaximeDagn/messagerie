  // Accueil Dashboard //
$(document).ready(function(){
//<-- Fonction Graphique -->
//Appel des périodes axe X
function getLibelles(periode) {
  if (periode == 1){
    return ["01/01/18", "02/01/18", "03/01/18", "04/01/18", "05/01/18", "06/01/18", "07/01/18", "08/01/18", "09/01/18", "10/01/18", "11/01/18", "12/01/18"];
  }else{
      return ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",];
  }
}
//Fonction appel des données axe Y
function afficheGraphique(myDataId, periode, myUser) {
  var ctxB = document.getElementById(myDataId).getContext('2d');
  var type;
  var texte = getLibelles(periode);
  switch (myDataId) {
    case "exercice":
      type = "Minutes";
      break;
    case "calorie":
      type = "Calories";
      break;
    default:
      type = "Kilogrammes";
      break;
  }
  $.ajax({
     type: "GET",
     url: "/api/graphic?id="+myDataId+"&user="+myUser,
     dataType : "json",  
     error:function(msg, string){
         alert( "Error !: " + string );
     },  
     success:function(data){
      var valeur = data;
      valeur.reverse()
      graphict(ctxB, type, valeur, texte);
     }
  });
}
//Clic pour lancez les fonctions en fonction des boutons
$(".lienGraphic").click(function(){
  var myDataId = $(this).attr("data-id");
  var periode = $('#periode').val();
  var user = $(this).attr("data-user");
  afficheGraphique(myDataId, periode, user);
});
//Clic pour lancez les fonctions depuis le choix période
$("#periode").change(function(){
  var lien = $(".lienGraphic.active").first();
  var myDataId = lien.attr("data-id");
  var periode = $(this).val();
  var user = lien.attr("data-user");
  afficheGraphique(myDataId, periode, user);
});
// fonction pour le graphique
function graphict(ctxb, type, valeur, texte){
    var myBarChart = new Chart(ctxb, {
    type: 'line',
    data: {
        labels: texte,
        datasets: [{
            label: type,
            data: valeur,
            backgroundColor: ['rgb(255, 99, 132)','rgb(54, 162, 235)','rgb(255, 206, 86)','rgb(75, 192, 192)','rgb(153, 102, 255)','rgb(255, 159, 64)','rgb(255, 99, 132)','rgb(54, 162, 235)','rgb(255, 206, 86)','rgb(75, 192, 192)','rgb(153, 102, 255)','rgb(255, 159, 64)'
            ],
            borderColor: ['rgba(255,99,132,1)','rgba(54, 162, 235, 1)','rgba(255, 206, 86, 1)','rgba(75, 192, 192, 1)','rgba(153, 102, 255, 1)','rgba(255, 159, 64, 1)','rgba(255,99,132,1)','rgba(54, 162, 235, 1)','rgba(255, 206, 86, 1)','rgba(75, 192, 192, 1)','rgba(153, 102, 255, 1)','rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    optionss: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
    }
});
}
// Lancement de toutes les fonctions au chargement de la page //
$('.lienGraphic').first().trigger('click');
//<-- Fin De Fonction Graphique -->
});