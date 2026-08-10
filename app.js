const express = require('express');
const app = express();
const pageRoutes = require('./routes/page');
const path = require('path')

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));

app.use('/css', express.static('./public/css'))

app.use('/', pageRoutes)
module.exports = app;
