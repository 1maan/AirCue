const express = require('express');
const app = express();
const pageRoutes = require('./routes/page');
const apiRoutes = require('./routes/api');
const path = require('path')
require('dotenv').config();

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_KEY1, process.env.SESSION_KEY2],
  cookie: {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 170 * 60 * 60 * 1000
    }
}))

// const cors = require('cors');
// const SITE_URL = `http://${process.env.ORIGIN}:${process.env.PORT}`

// app.use('/api', cors({
//     origin: SITE_URL
// }))

// app.use('/api', (req, res, next) => {
//     let origin = req.get('Origin');
//     if(origin != SITE_URL){
//         return res.status(403).send('Forbidden');
//     }

//     next();
// });


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));

app.use('/js', express.static('./public/js'))
app.use('/css', express.static('./public/css'))
app.use('/fonts', express.static('./public/fonts'))
app.use('/img', express.static('./public/img'))

app.use('/', pageRoutes);
app.use('/api', apiRoutes);

module.exports = app;
