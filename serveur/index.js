const express = require('express');
const app = express();
const md5 = require('md5');
const sha1 = require('sha1');
const fs = require('fs'); 
const https = require('https');
const options = {
    cert: fs.readFileSync('/etc/letsencrypt/live/maxime.ws312.net/fullchain.pem'),
    key: fs.readFileSync('/etc/letsencrypt/live/maxime.ws312.net/privkey.pem')
};
const server = https.createServer(options, app).listen(443);
const io = require('socket.io')(server);
//server.listen(80);
const fileUpload = require('express-fileupload');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const MongoClient = require("mongodb").MongoClient;
// Variable Globale //
var allClients = [];
var sockets = {};
var socketsAdmin = {};
var adminOnLineId = [];
var adminOnLineName = [];
//Fin des variable globale //
app.use(cookieParser());
app.set('view engine', 'ejs');
app.use(fileUpload());
app.use(function(req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
//Use pour Body-parser //
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//appel des routes css js//
app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/js'));
app.use(express.static(__dirname + '/node_modules'));
app.use(express.static(__dirname + '/vendor'));
app.use(express.static(__dirname + '/img'));
// ROUTAGE //
app.get('/login', function (req, res){
  res.sendFile( __dirname  + '/templates/adminlog.html');
});
app.get('/disconnection', function (req, res){
    res.send("ok");
});
// Page erreur//
app.get('/400', function(req,res){
    res.sendFile( __dirname  + '/templates/error/400.html');
});
app.get('/403', function(req,res){
    res.sendFile( __dirname  + '/templates/error/403.html');
});
app.get('/404', function(req,res){
    res.sendFile( __dirname  + '/templates/error/404.html');
});
app.get('/500', function(req,res){
    res.sendFile( __dirname  + '/templates/error/500.html');
});
// Fin erreur //
// Inscription //
app.post('/register', function (req, res){
    if(req.body.email === undefined || req.body.password === undefined || req.body.name === undefined){
        res.redirect('/400');
    }else{
        var email = req.body.email;
        var password = req.body.password;
        var name = req.body.name;
        var role = (req.body.role === undefined) ? 'Pending': req.body.role;
        var salt = getUniqueID();
        var passwordcrypt = sha1(sha1(password)+sha1(email)+sha1(salt));
        var idadmin = getUniqueID();
        MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
            if(error) throw error;
            db.collection("admin").findOne({'email': email }, function(err, result){
                 if (err) throw err;
                 if (result === null){
                    db.collection("admin").insert({'email': email ,'password' : passwordcrypt,'name': name, 'role' : role, 'idadmin': idadmin, 'salt':salt, 'image': 'operateur.png'})
                    res.send("ok");
                    db.close();
                 }else{
                    res.send('email');
                    db.close();
                 }
            });
        });
    }
});
// Connexion //
app.post('/connection', function (req, res){
    if(req.body.email === undefined || req.body.password === undefined){
        res.redirect('/400');
    }else{
    var email = req.body.email;
    var password = req.body.password;
        MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
                if(error) throw error;
            db.collection("admin").findOne({'email': email }, function(err, result){
                if (err) throw err;
                if(result !=  null){
                    var passwordcrypt = sha1(sha1(password)+sha1(email)+sha1(result.salt));
                    if (result.password == passwordcrypt){
                        name = result.name;
                        id = result.idadmin;
                        res.send({name : name, id : id});
                        db.close();
                    }else{
                        res.send('mdp');
                        db.close();
                    }
                }
            });
        });
    }
});
// Page admin //
    // Accueil //
    app.get('/accueil', function(req, res){
        var idadmin =  req.cookies.idadmin;
        if (idadmin === undefined){
            res.redirect('/403');
        }else{
            MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
                if(error) throw error;
                db.collection("admin").findOne({'idadmin': idadmin }, function(err, result){
                    if(result.role === 'Pending'){
                        res.sendFile( __dirname  + '/templates/attente.html');
                        db.close();
                    }else{
                        res.render( __dirname  + '/templates/accueil.ejs', {name: result.name, grade: result.role, image: result.image});
                        db.close();
                    }
                });
            });
        }
    })
    // Modération //
    app.get('/interface', function (req, res){
        var idadmin =  req.cookies.idadmin;
        var convers = [];
        if (idadmin === undefined){
            res.redirect('/403');
        }else{
            MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
                if(error) throw error;
                db.collection("admin").findOne({'idadmin': idadmin }, function(err, result){
                    if(result.role === 'Pending'){
                        res.sendFile( __dirname  + '/templates/attente.html');
                    }else{
                        db.collection("convers").find({"idadmin": idadmin, "archive": "no"}).toArray(function(error, results){
                            if (error) throw error;
                            for(var i = 0; i < results.length ; i++){
                                convers.push(results[i]);
                            }
                                res.render( __dirname  + '/templates/interface.ejs', {client: convers, name: result.name, grade: result.role, image: result.image});
                                db.close();
                        });  
                    }
                });
            });
        }
    });
    // Profil //
    app.get('/profil', function (req, res){
        var idadmin =  req.cookies.idadmin;
        if (idadmin === undefined){
            res.redirect('/403');
        }else{
            MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
                if(error) throw error;
                db.collection("admin").findOne({'idadmin': idadmin }, function(err, result){
                    if(result.role === 'Pending'){
                        res.sendFile( __dirname  + '/templates/attente.html');
                        db.close();
                    }else{
                        res.render( __dirname  + '/templates/profiladmin.ejs', {name: result.name, infos: result, grade: result.role});
                        db.close();  
                    }
                });
            });
        }
    });
    app.get('/pending', function(req, res){
        res.sendFile( __dirname  + '/templates/attente.html');
    })
    app.get('/administration', function(req, res){
        var idadmin = req.cookies.idadmin;
        if (idadmin === undefined){
            res.redirect('/403');
        }else{
            MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
                if(error) throw error;
                db.collection("admin").findOne({'idadmin': idadmin }, function(err, result){
                    if(result.role === 'Pending'){
                        res.sendFile( __dirname  + '/templates/attente.html');
                        db.close();
                    }else if(result.role != 'administrateur'){
                        res.render( __dirname  + '/templates/accueil.ejs', {name: result.name, grade: result.role, image: result.image});
                        db.close();
                    }else{
                        res.render( __dirname  + '/templates/administration.ejs', {name: result.name, grade: result.role, image: result.image});
                        db.close();
                    }
                });
            });
        }
    })
    // Mise à jour profil //
    app.post('/updateAdmin', function(req, res){
        if(req.body.name === undefined || req.body.email === undefined || req.body.idadmin === undefined){
            res.redirect('/400');
        }else{
            var name = req.body.name;
            var email = req.body.email;
            var idadmin = req.body.idadmin;
            MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
                if(error) throw error;
                    db.collection("admin").update({idadmin: idadmin},{$set:{email: email, name: name}});
                    db.close();
            });
            res.send("ok");
        }
    })
    app.post('/updateAdminPassword', function(req, res){
        if(req.body.password === undefined || req.body.idadmin === undefined || req.body.email === undefined){
            res.send('errFieldEmpty')
        }else{
            var password = req.body.password;
            var idadmin = req.body.idadmin;
            var email = req.body.email;  
            MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
                if(error) throw error;
                db.collection("admin").findOne({'idadmin': idadmin }, function(err, result){
                    if(err) throw err;
                    var passwordcrypt = sha1(sha1(password)+sha1(email)+sha1(result.salt));
                    db.collection("admin").update({idadmin: idadmin},{$set:{password: passwordcrypt}});
                    db.close();
                });
            });
            res.send("ok");
        }
    })
    app.post('/updateImg', function(req, res){
      if(!req.files)
        return res.status(400).send('No files were uploaded.');
      let sampleFile = req.files.sampleFile;
      var nameimg = req.body.idclient;
      var format = (sampleFile.mimetype == 'image/png') ? '.png' : (sampleFile.mimetype == 'image/jpeg') ? '.jpg' : null;
      if(format != null){
        MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
            if(error) throw error;
                db.collection("admin").update({idadmin: nameimg},{$set:{image: nameimg+format}});
            sampleFile.mv(__dirname  + '/img/'+nameimg+format, function(err){
                if (err) return res.status(500).send(err);
                db.collection("admin").findOne({'idadmin': nameimg }, function(err, result){
                    res.render( __dirname  + '/templates/profiladmin.ejs', {name: result.name, infos: result, grade: result.role, resultat: 'Votre image est bien modifié'}); 
                    db.close();
                });
            });
        });
      }else{
        MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
            if(error) throw error;
            db.collection("admin").findOne({'idadmin': nameimg }, function(err, result){
                res.render( __dirname  + '/templates/profiladmin.ejs', {name: result.name, infos: result, grade: result.role, resultat: 'Votre image ne correspond pas au format demandé JPG où PNG'});
                db.close();
            });
        });
      }
    });
    // Fin Maj profil //
    // Statut Admin //
    app.post('/statusAdmin', function(req, res){
        if(req.body.idadmin === undefined || req.body.statut === undefined){
            res.redirect('/400');
        }else{
            var idadmin = req.body.idadmin;
            var statut = req.body.statut;
            MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
            if(error) throw error;
                db.collection("admin").findOne({'idadmin': idadmin }, function(err, result){
                    if(result != null){
                        if(statut === 'on'){
                            var testadmin = adminOnLineId.indexOf(result.idadmin);
                            if(testadmin == -1){
                                adminOnLineId.push(result.idadmin);
                                adminOnLineName.push(result.name);
                            }
                        }else if(statut === 'off'){
                            var posName = adminOnLineName.indexOf(result.name);
                            var posId = adminOnLineId.indexOf(result.idadmin);
                            adminOnLineName.splice(posName, 1);
                            adminOnLineId.splice(posId, 1);
                        }
                    }
                });
                db.close();
            });
            res.send("ok");
        }
    })
    // Fin statut //
    // Action sur l'utilisateur //
    app.post('/actuAdmin', function(req, res){
        if(req.body.idconvers === undefined || req.body.idadmin === undefined){
            res.redirect('/400');
        }else{
            var idconvers = req.body.idconvers;
            var idadmin = req.body.idadmin;
            var image;
            var nameadmin;
            var messageBdd;
            MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
            if(error) throw error;
                db.collection("admin").findOne({'idadmin': idadmin }, function(err, result){
                    if (err) throw err;
                    image = result.image;
                    nameadmin = result.name;
                });
                db.collection("message").find({"_idconvers": idconvers}).toArray(function(error, results){
                    if (error) throw error;
                    messageBdd = results;
                    res.send({message: messageBdd, nameadmin: nameadmin, image: image});
                });
                db.collection("message").update({'_idconvers': idconvers, 'seen': 'no'},{$set:{'seen': 'yes'}},{multi: true});
                db.close();
            });
        }
    })
    app.post('/updateClient', function(req, res){
        if(req.body.name === undefined || req.body.client === undefined || req.body.infos === undefined){
            res.redirect('/400');
        }else{
            if(['name', 'email', 'phone'].indexOf(req.body.name) !== -1) {
                updateSession(req.body.client, req.body.name, req.body.infos)
                res.send('ok') ;
            }else{
                res.send('no-ok') ;
            }
        }
    })
    // fin action utilisateur //
// Fin page admin //
// Dashboard //

app.post('/dashboardConvers', function(req, res){
    if(req.body.idadmin === undefined){
        res.redirect('/400');
    }else{
        var idadmin = req.body.idadmin;
        MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
        if(error) throw error;
        var nbconvers;
            db.collection("convers").find({idadmin: idadmin}).count(function(error, nbconvers){
                nbconvers = nbconvers;
                db.collection("convers").find({idadmin: idadmin}).toArray(function(error, result){
                    var nbmessage = 0;
                    var nbmessageAdmin = 0;
                    var passage = 0;
                    var length = result.length;
                    for(var i=0; i < result.length; i++){
                        db.collection("message").find({'_idconvers': result[i]._idconvers, type:'message'}).count(function(error, resultNb){
                            passage++;
                            if(passage < length){
                                nbmessage +=  resultNb;
                            }else{
                                nbmessage +=  resultNb;
                                res.send({nbconvers: nbconvers, nbmessage: nbmessage});
                                db.close();
                            }
                        })
                    }
                })
            })
        });
    }
})
app.post('/dashboardNote', function(req, res){
    if(req.body.idadmin === undefined){
        res.redirect('/400');
    }else{
        var idadmin = req.body.idadmin;
        MongoClient.connect("mongodb://localhost/projetchat", function(error, db){       
        if(error) throw error;
            db.collection("convers").find({idadmin: idadmin}).toArray(function(error, result){
                res.send(result);
                db.close();
            })
        });
    }
})
app.post('/dashboardConversDeux', function(req, res){
    if(req.body.idadmin === undefined){
        res.redirect('/400');
    }else{
        var idadmin = req.body.idadmin;
        var convers;
        MongoClient.connect("mongodb://localhost/projetchat", function(error, db){       
        if(error) throw error;
            db.collection("convers").find({idadmin: idadmin}).toArray(function(error, result){
                convers = result;
                var passage = 0;
                var length = result.length;
                var datefirst = [];
                for(var i=0; i<result.length; i++){
                    db.collection("message").findOne({'_idconvers' : result[i]._idconvers, type: 'message'}, { sort: { _id: -1 }, limit: 1 }, function(err, resultat){
                        passage++;
                        if(passage < length){
                            datefirst.push(resultat['date'])
                        }else{
                            datefirst.push(resultat['date'])
                            res.send({infosconvers: convers, datefirst: datefirst});
                            db.close();
                        }
                    })
                }
            })
        });
    }
})
// Fin dashboard //
//Administration //
app.get('/recoveListeAdmin', function(req, res){
    MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
        if(error) throw error;
        db.collection("admin").find().toArray(function(error, result){
        res.send(result);
        db.close();
        })
    });
})
app.post('/removeAdmin', function(req, res){
    if(req.body.idadmin === undefined){
        res.redirect('/400');
    }else{
        var idadmin = req.body.idadmin;
        MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
            if(error) throw error;
            db.collection("admin").remove({'idadmin': idadmin}, function(error, succes){
                if(error) throw error;
                    res.send('ok');
                    db.close();
            })
        });
    }
})
app.post('/editAdmin', function(req, res){
    if(req.body.idadmin === undefined){
        res.redirect('/400');
    }else{
        var idadmin = req.body.idadmin;
        var role = req.body.role;
            MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
            if(error) throw error;
            db.collection("admin").update({idadmin: idadmin},{$set:{role: role}});
            res.send('ok')
            db.close();
        });
    }
})
// Fin administratio //
// Recherche admin du client //
app.post('/adminOfClient', function(req, res){
    if(req.body.idconvers === undefined){
        res.send('errFieldEmpty')
    }else{
        var idconvers = req.body.idconvers;
        MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
            if(error) throw error;
            db.collection("convers").findOne({'_idconvers': idconvers }, function(err, result){
                if(err) throw error;
                if(result != null){
                    if(result.idadmin != null){
                        db.collection("admin").findOne({'idadmin': result.idadmin }, function(errTwo, results){
                            if(errTwo) throw errTwo;
                            res.send({image: results.image, name: results.name, idadmin: results.idadmin})
                            db.close();
                        })
                    }else{
                        res.send('null')
                        db.close();
                    }
                }else{
                    res.send('null')
                    db.close();
                }
            });
        });
    }
})
// fin admin du client //
app.post('/insert', function(req, res){
    if(req.body.message === undefined || req.body.idClient === undefined || req.body.idconvers === undefined){
        res.redirect('/400');
    }else{
    	insertnewmsg(req.body.message, req.body.idClient, req.body.idconvers);
        res.send("ok");
    }
})
app.post('/insertAdmin', function(req, res){
    if(req.body.message === undefined || req.body.idconvers === undefined || req.body.adminid === undefined){
        res.redirect('/400');
    }else{    
        insertnewmsgadmin(req.body.message, req.body.idconvers, req.body.adminid);
        res.send("ok");
    }
})
app.get('/createUser', function(req, res){
    var idclient = getUniqueID();
    MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
        if(error) throw error;
        db.collection("user").insertOne({'_idclient': idclient})
        db.collection("user").update({'_idclient': idclient}, { $set: { name: 'Prénom', email: 'email@exemple.com', phone: '00-01-02-03-04'}});
        res.send(idclient);
        db.close()
    });
})
app.post('/recoveUser', function(req, res){
    if(req.body.idclient === undefined){
        res.redirect('/400');
    }else {
        var idclient = req.body.idclient;
        MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
            if(error) throw error;
            db.collection("user").findOne({'_idclient': idclient}, function(err, result){
                if(result === null){
                        var newidclient = getUniqueID();
                        db.collection("user").insertOne({'_idclient': newidclient})
                        db.collection("user").update({'_idclient': newidclient}, { $set: { name: 'Prénom', email: 'email@exemple.com', phone: '00-01-02-03-04'}});

                        res.send({idclient : newidclient, result: 'change'});
                        db.close();
                }else{
                    res.send({idclient: idclient, result: 'keep'});
                    db.close();
                }
            })
        });
    }
})
app.post('/updateClientConvers', function(req, res){
    if(req.body.idconvers === undefined || req.body.name === undefined || req.body.infos === undefined ){
        res.redirect('/400');
    }else{
        if(['adresseip', 'agent', 'plateform'].indexOf(req.body.name) !== -1) {
            updateSessionConvers(req.body.idconvers, req.body.name, req.body.infos)
            res.send('ok');
        }else{
            res.send('nok');
        }
    }
})
// Verif convers client //
app.post('/checkConvers', function(req, res){
    if(req.body.checkConvers === undefined){
        res.redirect('/400');
    }else{
        var idconvers = req.body.checkConvers;
        MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
            if(error) throw error;
            db.collection("convers").findOne({'_idconvers': idconvers}, function(err, result){
                if(result === null){
                   res.send('keep');
                   db.close();
                }else{
                    if(result.archive === 'yes'){
                        res.send('change');
                        db.close();
                    }else{
                        res.send('keep');
                        db.close();
                    }
                }
            });
        })
    }
})
//Fin verif convers client //
// Route archive des convers //
app.post('/archivconvers', function(req, res){
    archivconvers(req.body.idconvers, req.body.idadmin)
    res.send('ok');
})
// Fin fonction archive des convers //
// Recherche historique convers //
app.post('/searchLastConvers', function(req, res){
    if(req.body.idclient === undefined){
        res.redirect('/400');
    }else{
        var idclient = req.body.idclient;
        var historic;
        MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
            if(error) throw error;
            db.collection("convers").find({"client": idclient, "archive": 'yes'}).toArray(function (error, results){
                    if (error) throw error;
                historic = results;
                if (historic != ""){
                res.send(historic);
                db.close();
                }else{
                res.send("no");
                db.close();
                }
            });
        });
    }
})
// Fin recherche historique convers //
// tchathistory //
app.post('/tchatHistory', function(req, res){
    if(req.body.idclient === undefined || req.body.idconvers === undefined || req.body.idadmin === undefined){
        res.redirect('/400');
    }else{
        var idclient = req.body.idclient;
        var idconvers = req.body.idconvers;
        var idadmin = req.body.idadmin;
        MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
            if (error) throw error;
            db.collection("convers").find({"client": idclient, "archive": 'yes'}).toArray(function(error, result){
                if(error) throw error;
                for(var i=0; i < result.length; i++){
                    db.collection("message").find({"_idconvers": result[i]._idconvers}).toArray(function(error, results){
                        if(socketsAdmin[idadmin] === 'undefined'){
                            console.log('set admin non défini')
                        }else{ 
                            for(var socket in socketsAdmin[idadmin].session){
                                socketsAdmin[idadmin].session[socket].emit('push-history', results, idconvers);
                            }
                        }
                    })
                }
            res.send('ok');
            db.close();
            })    
        });
    }
})
//  Fin tchathistory //

// Transfert conversation //
app.post('/transferConvers', function(req, res){
    if(req.body.nameclient ===undefined || req.body.idconvers === undefined || req.body.comment === undefined || req.body.idadminNow === undefined){
        res.redirect('/400');
    }else{
        var adminname = req.body.nameclient;
        var idconvers = req.body.idconvers;
        var comment = req.body.comment;
        var idadminNow = req.body.idadminNow;
        MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
            if(error) throw error;
            db.collection("admin").findOne({'idadmin': adminname}, function(err, result){
                if (err) throw err;
                db.collection('convers').update({_idconvers: idconvers}, { $set: { idadmin: result.idadmin}});
                db.collection('convers').update({_idconvers: idconvers}, { $addToSet: { 'lastAdmin': idadminNow}});
                    searchAdminConvers(result.idadmin);
                db.collection("message").insert({'_idconvers': idconvers, 'message': 'Transfert de conversation, Motif: '+comment, 'date': new Date(), type: 'log'})
                db.collection("message").insert({'_idconvers': idconvers, 'message': 'Votre conversation viens d\'être transféré', 'date': new Date(), type: 'logP'})
                    searchAdminConvers(idadminNow);
                    res.send('ok')
                    db.close();
            });
        });
    }
})
// Fin transfert conversation //
// Commentaire client //
app.post('/addCommentaire', function(req, res){
    if(req.body.commentaire === undefined || req.body.idconvers === undefined){
        res.redirect('/400');
    }else{
        var content = req.body.commentaire;
        var convers = req.body.idconvers;
        MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
            if(error) throw error;
            db.collection("message").insert({'_idconvers': convers, 'message': content, 'date': new Date(), type: 'comment'})
            res.send('ok');
            db.close();
        });
    }
})
// Fin commentaire client //

// Chemin du visiteur //
app.post('/pathClient', function(req, res){
    if(sockets[req.body.idclient] != undefined){
        res.send(sockets[req.body.idclient].url);
    }
})
// Fin chemin visiteur //
// Stats du visiteur //
app.post('/statsClient', function(req, res){
    if(req.body.idclient === undefined || req.body.idconvers === undefined){
        res.redirect('/400');
    }else{
        var idclient =  req.body.idclient;
        var idconvers = req.body.idconvers;
        var nbconvers;
        var firstConvers;
        var firstMsg;
        MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
            if(error) throw error;
            db.collection("convers").find({'client' : idclient}).count( function(err, results){
                if(err) throw err;
                nbconvers = results;
                db.collection("convers").findOne({'client' : idclient}, {limit: 1 }, function(errorTwo, result){
                    if(errorTwo) throw errorTwo;
                    firstConvers = result.date;
                    db.collection("message").findOne({'_idconvers' : idconvers, type: 'message'}, {limit: 1 }, function(errTwo, resultat){
                        if(errTwo) throw errTwo;
                        firstMsg = resultat.date;
                        res.send({nbconvers: nbconvers, firstConvers: firstConvers, firstMsg: firstMsg});
                        db.close();
                    })
                })
            })
        });
    }
})
// fin stats visiteur//
// Note admin //
app.post('/updateNote', function(req, res){
    if(req.body.convers === undefined || req.body.note === undefined){
        res.redirect('/400');
    }else{
        var idconvers = req.body.convers;
        var note = req.body.note;
        MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
            if(error) throw error;
            db.collection('convers').update({_idconvers: idconvers}, { $set: { note: note}});
            res.send('ok');
            db.close();
        });
    }
})
// Fin note admin //
function insertnewmsg(message, idclient, idconvers){
    MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
	        if(error) throw error;
        db.collection("convers").findOne({'_idconvers': idconvers }, function(err, result){
             if (err) throw err;
             if (result === null){
                db.collection("convers").insert({'_idconvers': idconvers ,'client' : idclient,'idadmin': null,'nameidadmin': null,'archive': 'no', 'nbmessage': 0,'note': null, 'date' : new Date(), 'lastAdmin':[]})
                db.collection("message").insert({'_idconvers': idconvers, 'auteur': idclient, 'message': idclient+' viens de créer la conversation', 'date': new Date(), type: 'log'})
                db.close();
             }else if(result.archive === 'break'){
                db.collection('convers').update({_idconvers: idconvers}, { $set: { archive: 'no'}});
                searchAdminConvers(result.idadmin)
                db.close();
             }
        });
        db.collection("message").insert({'_idconvers': idconvers, 'auteur': idclient, 'message': message, 'date': new Date(), type: 'message', seen: 'no'})
    });
}
function insertnewmsgadmin(message, idconvers, adminid){
    MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
    	if(error) throw error;
    	db.collection("message").insert({'_idconvers' : idconvers, 'message' : message,'auteur' : adminid, 'date' : new Date(), type: 'message', seen: 'yes'})
        db.close();
    });
}
function getUniqueID(){ 
    var uniqueID = new Date();
    var dodo = uniqueID.getTime();
    var test = makeid();
    return dodo +''+ test;
}
function makeid(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 15; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}
function updateSession(client, champs, value){
    MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
        if(error) throw error;
        var up = {"$set": {}};
        up['$set'][champs] = value;
        db.collection("user").update({_idclient: client}, up);
        db.close();
    });
    var idconvers = null;
    addinfos(client, idconvers);
}
function updateSessionConvers(idconvers, champs, value){
    MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
        if(error) throw error;
        var up = {"$set": {}};
        up['$set'][champs] = value;
        db.collection("convers").update({_idconvers: idconvers}, up);
        db.collection("convers").findOne({_idconvers: idconvers}, function(err, result){
            if(result != null){
                var client = result.client;
                addinfos(client, idconvers);
            }
        })
        db.close();
    });
}
// Partie SOCKET //
var clientOff = {};
// Reception des emits depuis les pages //
io.sockets.on('connection', function(socket){
    // Emit depuis le client
    socket.on('lastId', function(id, idconvers){
    //Enregistrement des clients en ligne //
        clientOff[id] = {id:id, date:null};
        allClients.push(id);
        socket.on('disconnect', function(){
            var i = allClients.indexOf(id);
            clientOff[id].date = Date.now();
            allClients.splice(i, 1);
            if(sockets[id].session.indexOf(socket)){
                var pos = sockets[id].session.indexOf(socket);
                sockets[id].session.splice(pos, 1);
            }
        });
        if(sockets[id] === undefined){
            sockets[id] = {session:[], lastid:null, convers: idconvers, name:null, email:null, phone:null, plateform:null, adresseip:null, agent:null, url:[], lastCo:null};
            if(sockets[id].session.indexOf(socket)){
                sockets[id].session.push(socket)
            }
        }else{  
            if(sockets[id].session.indexOf(socket)){
                sockets[id].session.push(socket)
            }
        }
        sockets[id].convers = idconvers;
        searchlastid(id, idconvers);
        addinfos(id, idconvers);
    });
        // Emit url client //
        socket.on('urlclient', function(nameclient, urlclient){
            var lengthTab = sockets[nameclient].url.length;
            if(lengthTab === 0){
                sockets[nameclient].url.push(urlclient);
            }else if(sockets[nameclient].url.lastIndexOf(urlclient) != lengthTab -1){
                sockets[nameclient].url.push(urlclient);
            }
        })
        socket.on('clientWrite', function(idconvers){
            clientWrite(idconvers);
        })
        socket.on('clientEndWrite', function(idconvers){
            clientEndWrite(idconvers);
        })
        // FIn emit url client //
    //Fin emit depuis le client //
    // Emit depuis de l'admin //
            socket.on('adminConnect', function(idadmin){
                socket.on('disconnect', function(){
                    if(socketsAdmin[idadmin].session.indexOf(socket)){
                        var pos = socketsAdmin[idadmin].session.indexOf(socket);
                        socketsAdmin[idadmin].session.splice(pos, 1);
                    }
                });
                if(socketsAdmin[idadmin] === undefined){
                    socketsAdmin[idadmin] = {session:[], lastid:null};
                    if(socketsAdmin[idadmin].session.indexOf(socket)){
                        socketsAdmin[idadmin].session.push(socket)
                    }
                }else{  
                    if(socketsAdmin[idadmin].session.indexOf(socket)){
                        socketsAdmin[idadmin].session.push(socket)
                    }
                }
                profilAdmin(idadmin);
            })
        // Admin write //
        socket.on('adminWrite', function(idconvers, idclient){
            if(typeof sockets[idclient] === 'undefined'){
                console.log('Id client non défini')
            }else{
                for(var socket in sockets[idclient].session){
                    sockets[idclient].session[socket].emit('push-adminWriteForClient', idconvers);
                }
            }
        })
        socket.on('adminEndWrite', function(idconvers, idclient){
            if(typeof sockets[idclient] === 'undefined'){
                console.log('Id client non défini')
            }else{
                for(var socket in sockets[idclient].session){
                    sockets[idclient].session[socket].emit('push-adminEndWriteForClient', idconvers);
                }
            }
        })
        // Fin admin write //
        // Emit ajout new client //
            socket.on('push-addNewClient', function(name, idconvers, idnewclient){
                updateNewClient(name, idconvers, idnewclient);
            });
        // Fin emit ajout client //
    //Fin emit admin //
});
// Fin de reception des emit //
// Début des fonctions du client //
    //Récupération du dernier id //
    function searchlastid(id, idconvers){
        var hnow = new Date();
        MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
            if(error) throw error;
            db.collection("message").findOne({"date" : { $gt : hnow },'_idconvers' : idconvers }, function(err, result){
                if (err) throw err;
                if (result === null){
                    sockets[id].lastid = null;
                }else{
                    sockets[id].lastid = result.date;
                }
            db.close();
            }); 
        });
    }
    // FIn récupération dernier id //
    // Récupération infos client //
    function addinfos(id, idconvers){
        if(sockets[id] != undefined){
            MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
                if(error) throw error;
                db.collection("user").findOne({'_idclient' : id }, function(err, result){
                     if (err) throw err;
                    sockets[id].name = result.name;
                    sockets[id].email = result.email;
                    sockets[id].phone = result.phone;
                    db.close();
                }); 
            });
        }
        if(idconvers != null){
            MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
                if(error) throw error;
                db.collection("convers").findOne({'_idconvers' : idconvers }, function(err, result){
                     if (err) throw err;
                    if(result != null){
                        sockets[id].plateform = result.plateform;
                        sockets[id].adresseip = result.adresseip;
                        sockets[id].agent = result.agent;
                    }
                    db.close();
                }); 
            });
        }
    }
    // Fin récupération client //
    // Récupération des new messages //
        // Set interval récupération des nouveaux messages //
        setInterval(function(){
            for (var id in sockets) {
                if(typeof sockets[id] === 'undefined' || typeof sockets[id].lastid === 'undefined' || typeof sockets[id].convers === 'undefined'){
                    console.log("non défini conversation Client");
                }else{
                    searchMsgClient(sockets[id].lastid, sockets[id].convers, id); 
                }
            }
        }, 1000);
        // Fin set interval //
        // Fonction récupération des messages //
        function searchMsgClient(lastid, convers, id){
            var idtest = id;
            var date = (typeof lastid === "number") ? new Date(lastid) : lastid;
            var messageBdd;
            //connection à mongoDB.
            MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
                if(error) throw error;
                var req = (lastid === null) ? {"_idconvers": convers, "type": "message"} : {"date" : { $gt : date },"_idconvers": convers};
                db.collection("message").find(req).toArray(function (error, results){
                    if (error) throw error;
                    messageBdd = results;
                    if (messageBdd != ""){
                        for (var i = 0; i <= messageBdd.length -1; i++){
                            sockets[idtest].lastid = messageBdd[i]['date'];     
                        }
                        for (var id in sockets){
                            for(var socket in sockets[id].session){
                                sockets[id].session[socket].emit('push-message', messageBdd);
                            }
                        }
                    }
                    db.close();
                });
            });
        };
        // client writte 
        function clientWrite(idconvers){
            MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
                if(error) throw error;
                db.collection("convers").findOne({'_idconvers' : idconvers}, function(err, resultat){
                    if(resultat != null){
                        if(typeof socketsAdmin[resultat.idadmin] === 'undefined'){
                            console.log('non défini admin clientWrite');
                        }else{
                            for(var socket in socketsAdmin[resultat.idadmin].session){
                                socketsAdmin[resultat.idadmin].session[socket].emit('push-clientWriteForAdmin', idconvers);
                            }
                        }
                    }
                    db.close()
                })
            }); 
        }
        function clientEndWrite(idconvers){
            MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
                if(error) throw error;
                db.collection("convers").findOne({'_idconvers' : idconvers}, function(err, resultat){
                    if(typeof socketsAdmin[resultat.idadmin] === 'undefined'){
                        console.log('non défini admin clientWrite');
                    }else{
                        for(var socket in socketsAdmin[resultat.idadmin].session){
                            socketsAdmin[resultat.idadmin].session[socket].emit('push-clientEndWriteForAdmin', idconvers);
                        }
                    }
                    db.close();
                })
            }); 
        }
// Debut des fonctions de l'admin //
    // Information de l'admin //
    function profilAdmin(idadmin){
       MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
            if(error) throw error;
            db.collection("admin").findOne({'idadmin' : idadmin}, function(err, resultat){
                if(typeof socketsAdmin[idadmin] === 'undefined'){
                    console.log('admin undefined')
                }else{
                    for(var socket in socketsAdmin[idadmin].session){
                        socketsAdmin[idadmin].session[socket].emit('push-profileAdmin', resultat);
                    }
                }
                db.close();
            })
        });  
    }
    // FIn information de l'admin //
    // Vérification de nouveau message non attribué //
        // Fonction récupération des messages non attribué //
        setInterval(function(){
            var messageBdd;
            //connection à mongoDB.
            MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
                if(error) throw error;
                //rechercher des message poster depuis le dernier id connu.
                db.collection("convers").find({"idadmin": null, 'archive': 'no'}).toArray(function (err, results){
                        if (err) throw err;
                    messageBdd = results;
                    //si des messages ont été reçu depuis écriture sur le templates puis enregistrement du dernier id.
                        for(var idadmin in socketsAdmin){
                            if(typeof socketsAdmin[idadmin] === 'undefined'){
                                console.log('non défini Admin')
                            }else{
                                if (messageBdd != ""){
                                    for(var socket in socketsAdmin[idadmin].session){
                                        socketsAdmin[idadmin].session[socket].emit('push-newClient', messageBdd);
                                    }
                                }else{
                                    for(var socket in socketsAdmin[idadmin].session){
                                        socketsAdmin[idadmin].session[socket].emit('push-newClient', 'empty');
                                    }
                                }
                            }
                        }
                db.close();
                });
            });
        }, 1000);
    // Fin de vérification des messages non attribués //
    // Ajout d'admin à la conversation //
    function updateNewClient(idadmin, idconvers, idnewclient){
        var messageBdd;
        MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
            if(error) throw error;
            if(typeof socketsAdmin[idadmin] === 'undefined'){
                console.log('admin undefined')
            }else{
                db.collection("convers").update({'_idconvers': idconvers},{$set:{idadmin: idadmin}});
                for(var socket in socketsAdmin[idadmin].session){
                    socketsAdmin[idadmin].session[socket].emit('push-newConvers', idnewclient, idconvers);
                }
                db.collection("admin").findOne({'idadmin' : idadmin}, function(err, result){
                if (err) throw err;
                db.collection("message").insert({'_idconvers': idconvers, 'message': result.name+' viens de rejoindre la conversation', 'date': new Date(), type: 'logP'})
                    if(typeof sockets[idnewclient] === 'undefined'){
                        console.log('idclient undefined')
                    }else{
                        for(var socket in sockets[idnewclient].session){
                                sockets[idnewclient].session[socket].emit('push-NewAdmin', result.image, result.name, result.idadmin);
                        }
                    }
                db.close();
                })
            }
        }); 
    }
    // Fin ajout admin à la conversation //
    // Actu des online //
    setInterval(function(){
        for(var idadmin in socketsAdmin){
            for(var socket in socketsAdmin[idadmin].session){
                socketsAdmin[idadmin].session[socket].emit('push-adminInline',adminOnLineId , adminOnLineName);
                for(var id in sockets){
                    socketsAdmin[idadmin].session[socket].emit('push-clientInline', sockets[id].name, sockets[id].email, sockets[id].phone, id, sockets[id].adresseip, sockets[id].plateform, sockets[id].agent);
                }
            }
        }
    }, 2000)
    // Fin actu //
    // Set interval nouveaux messages // 
    setInterval(function(){
        for (var idadmin in socketsAdmin){
            if(typeof socketsAdmin[idadmin]=== 'undefined' || typeof socketsAdmin[idadmin].lastid === 'undefined'){
            }else{
                searchMsgAdmin(socketsAdmin[idadmin].lastid, idadmin);
            }
        }
    }, 1000);
    // Fin set interval new msg //
    // Fonction récupération des messages //
    function searchMsgAdmin(lastid, idadmin){
        var date = (typeof lastid === "number") ? new Date(lastid) : lastid;
        var messageBdd;
        //connection à mongoDB.
        MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
            if(error) throw error;
            //rechercher des message poster depuis le dernier id connu.
            db.collection("convers").find({"idadmin": idadmin, 'archive': 'no'}).toArray(function(error, result){
                for(var i = 0; i <= result.length -1; i++){
                var req = (lastid === null) ? {"_idconvers": result[i]._idconvers} : {"date" : { $gt : date },"_idconvers": result[i]._idconvers};
                    db.collection("message").find(req).toArray(function(error, results){
                    if (error)
                        throw error;
                        messageBdd = results;
                        //si des messages ont été reçu depuis écriture sur le templates puis enregistrement du dernier id.
                        if (messageBdd != ""){
                            for (var i = 0; i <= messageBdd.length -1; i++){
                                socketsAdmin[idadmin].lastid = messageBdd[i]['date'];
                            }
                            for(var socket in socketsAdmin[idadmin].session){
                                socketsAdmin[idadmin].session[socket].emit('push-adminMessage', messageBdd);
                            }
                        }
                        db.close()
                    });
                }
            });
        });
    }
    // Fin fonctions récupération des messages //
    // Fonction recherche convers de l'admin //
    function searchAdminConvers(idadmin){
        var idconvers = [];
        var idclient = [];
        MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
        if(error) throw error;
            db.collection("convers").find({'idadmin': idadmin , 'archive': 'no'}).toArray(function(error, results){
                if(results.length > 0){
                    for(var i=0; i < results.length; i++){
                        idconvers.push(results[i]._idconvers);
                        idclient.push(results[i].client);
                    }
                    if(typeof socketsAdmin[idadmin] === 'undefined'){
                        console.log('admin undefined')
                    }else{
                        for(var socket in socketsAdmin[idadmin].session){
                            socketsAdmin[idadmin].session[socket].emit('push-conversAdmin', idconvers, idclient);
                        }
                    }
                }
                db.close();
            });
        });
    }
    // Fin recherche convers admin //
    // Fonction pour archiver les convers //
        // Archivage break //
        setInterval(function(){
            for(var id in clientOff){
                if(clientOff[id].date != null){
                    var difh = Date.now() - clientOff[id].date;
                    if(difh > 180000){
                        breakconvers(clientOff[id].id);
                    }
                }
            }
        }, 30000);
        function breakconvers(id){
            MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
                if(error) throw error;
                db.collection("convers").findOne({'client' : id, 'archive': 'no'}, { sort: { _id: -1 }, limit: 1 }, function(err, resultat){
                    if(resultat != null){
                        if(resultat.idadmin != null){
                            db.collection('convers').update({_idconvers: resultat._idconvers}, { $set: { archive: 'break'}});
                            searchAdminConvers(resultat.idadmin);
                            db.close();
                        }
                    }
                })
            }); 
        }
        // Fin archivage break //
        // Fonction manuel //
        function archivconvers(idendconvers, idadmin){
            var name;
            MongoClient.connect("mongodb://localhost/projetchat", function(error, db){if(error) throw error;
                db.collection("admin").findOne({'idadmin' : idadmin}, function(err, resultat){name = resultat.name});
                db.collection("convers").findOne({'_idconvers' : idendconvers}, function(err, result){if (err) throw err;
                    db.collection("message").find({'_idconvers' : idendconvers, type:'message'}).count( function(err, results){
                        db.collection('convers').update({_idconvers: idendconvers}, { $set: { archive: 'yes', 'nbmessage': results, 'nameidadmin': name, 'plateform': null, 'adresseip': null, 'agent': null}});
                        db.close();
                    });
                });
            });  
        }
        // Fin fonction manuel //
        setInterval(function(){
            MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
                if(error) throw error;
                db.collection("convers").find({$or: [{"archive": "no"}, {"archive": "break"}]}).toArray(function(error, results){
                    if(results.length > 0){
                        var nb = 0;
                        for(var i=0; i < results.length; i++){
                            serchmsg(results[i].idadmin, results[i]._idconvers)
                        }
                        db.close();
                    }
                });
            });
        }, 300000);
        function serchmsg(idadmin, idconvers){
            MongoClient.connect("mongodb://localhost/projetchat", function(error, db){
                db.collection("message").findOne({'_idconvers' : idconvers}, { sort: { _id: -1 }, limit: 1 }, function(err, resultat){
                    if(idadmin === null || idadmin === 'null' || idadmin === undefined){
                    }else{
                    var difh = Date.now() - Date.parse(resultat.date);
                        if(difh > 7200000){
                            archivconvers(idconvers, idadmin);
                        }
                    }
                    db.close();
                })
            })
        }
    // Fin fonction pour archiver les convers //
// Fin des fontions de l'admin //