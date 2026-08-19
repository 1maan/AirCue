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


app.use('/api', (req, res) => {
    return res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

app.use((req, res, next) => {

  res.status(404).render('error', {
        code: 404,
        title: 'Page Not Found',
        label: 'Page Not Found',
        heading: "This page isn't on the rundown.",
        description: 'The page you requested may have been moved, removed, or the address may be incorrect.'
  });

  // return res.status(403).render('error', {
  //     code: 403,
  //     title: 'Access Restricted',
  //     label: 'Permission Denied',
  //     heading: 'You don’t have access to this area.',
  //     description: 'Your AirCue account does not have permission to access this page or perform this operation.'
  // });

});

app.use((err, req, res, next) => {

    console.error(err);

    if (req.originalUrl.startsWith('/api')) {

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });

    }

    return res.status(500).render('error', {
        code: 500,
        title: 'System Error',
        label: 'Internal System Error',
        heading: 'Something went off-air.',
        description: 'AirCue encountered an unexpected system error while processing your request. Return to the newsroom and try again.'
    });

});

module.exports = app;
