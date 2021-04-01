const express = require('express');
const serverless = require ('serverless-http');
var chatRouter = require('./routes/chat');

const app = express();
const router = express.Router();

 //E' necessario usare per tutte le route il prefisso /.netlify/functions
 app.use('/.netlify/functions/api/chat', chatRouter);

 //NB!
 //NON è necessario avviare il server perchè stiamo creando una lambda function
 /*
 app.listen(port, () => {//NON FACCIO NULlA })
*/

module.exports = app;
module.exports.handler= serverless(app);  //Qui è dove esportiamo le nostre funzioni per netlify