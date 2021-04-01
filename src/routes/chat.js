var express = require('express');
var router = express.Router();
const serverless = require ('serverless-http');

const socketIo = require('socket.io');

var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://TripNav:tripnavigation@Primo.jweu5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
var channel = "chat0";
var server = "";

router.get('/', function(req, res, next) {
  res.json({
      user:"pinco pallino"
  });
});


router.get('/requestoldmsg', function (req, res, next){
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("TripNav");
        dbo.collection(channel).find().toArray(function(err, results) {
        if (err) throw err;
        this.result = results;
        res.send(result)
        db.close();
        });
    });
});





// Send Notification API
router.get('/send-notification', (req, res) => {
    const notify = {data: req.body};
    socketServer.emit('notification', notify); // Updates Live Notification
    res.send(notify);
});


// Socket Layer over Http Server
socketServer = socketIo(server);






// On every Client Connection
socketServer.on('connection', socket => {

    console.log('Socket: client connected');

        socket.on('signin', (nick, pass) => {

        MongoClient.connect(url, function(err, db) {
          if (err) throw err;
          var dbo = db.db("TripNav");
          dbo.collection("users").findOne({"nickname":nick}, function(err, result) {
            if (err) throw err;
            if(pass == result.password)
            {
              socketServer.emit('login', true);
            }
            else
            {
              socketServer.emit('login', false);
            }
            db.close();
          });
        });
      });


      socket.on('signup', (nick, pass) => {

        MongoClient.connect(url, function(err, db) {
          if (err) throw err;
          var dbo = db.db("TripNav");
          dbo.collection("users").find({"nickname":nick}).toArray(function(err, result) {
          if (result.length === 0)
          {
            var myobj = { "nickname": nick , "password":pass };
            dbo.collection("users").insertOne(myobj, function(err, res) {
            if (err) throw err;
            db.close();
        });
          }else
          {
            console.log("exist")
          }
          });
        });
      });

    socket.on('new-message', (nick, message, cnl) => {
      socketServer.emit('resp-message', message);
      socketServer.emit('resp-cnl', cnl);
      socketServer.emit('resp-usr', nick);
      channel = "chat" + cnl;
      
    
      //save msg on mongoDB
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("TripNav");
        var myobj = { "nickname": nick, "messaggio": message };
        dbo.collection(channel).insertOne(myobj, function(err, res) {
            if (err) throw err;
            console.log("1 document inserted " + "in " + channel + " by " + nick);
            db.close();
        });
    });

    });

    socket.on('Channel', (cnl) => {
      channel = "chat" + cnl
      console.log(channel);

      app.get('/requestoldmsg', function (req, res){
        MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("TripNav");
        dbo.collection(channel).find().toArray(function(err, results) {
        if (err) throw err;
        console.log(results);
        this.result = results;
        console.log(result);
        res.send(result)
        db.close();
        });
    });
});
        


    });

});
module.exports = router;
//Anche usando un modulo esterno dobbiamo esportare l'oggetto serverless(router)
module.exports.handler= serverless(router);
