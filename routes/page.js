const express = require('express');
const router = express.Router();
const db = require('../config/db');

const { blockUser , authPage } = require('../config/auth')

router.get('/', (req, res)=>{
    res.redirect('/dashboard')
})
router.get('/login', blockUser , (req, res)=>{
    res.render('login')
})
router.get('/run-order', (req, res)=>{
    res.render('run-order')
})
router.get('/run-order-editor', (req, res)=>{
    res.render('run-order-editor')
})
router.get('/teleprompter-controller', (req, res)=>{
    res.render('teleprompter-controller')
})
router.get('/teleprompter', (req, res)=>{
    res.render('teleprompter')
})
router.get('/Graphics', (req, res)=>{
    res.render('Graphics')
})
router.get('/admin', (req, res)=>{
    res.render('admin')
})
router.get('/Connections', (req, res)=>{
    res.render('Connections')
})
router.get('/screen', (req, res)=>{
    res.render('screen')
})
router.get('/dashboard', authPage, (req, res)=>{
    res.render('dashboard', { fullname: req.session.fullname, role: req.session.role })
})






function formatDatabaseDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

router.get('/runorders', authPage, (req, res)=>{
    const date = new Date();
    console.log(formatDatabaseDate(date))
    const sql = `
    SELECT 
        ro.id AS runorderID,
        ro.name,
        ro.run_date,
        ro.air_time,
        ro.status,
        COALESCE(u.full_name, 'No Producer') AS full_name
    FROM run_orders AS ro
    LEFT JOIN users AS u 
        ON u.id = ro.producer_id
    WHERE ro.run_date = ?
    ORDER BY air_time
    `;
    db.query(sql, [formatDatabaseDate(date)], (err, result)=>{
        if(err){
            return req.redirect('/404')
        }
        res.render('runorders', { fullname: req.session.fullname, role: req.session.role, runorders: result })
    })
})

router.get('/runorders-id', authPage, (req, res)=>{
    res.render('runorders-id', { fullname: req.session.fullname, role: req.session.role })
})

router.get('/stories', authPage, (req, res)=>{
    res.render('stories', { fullname: req.session.fullname, role: req.session.role })
})

router.get('/controller', authPage, (req, res)=>{
    res.render('controller', { fullname: req.session.fullname, role: req.session.role })
})
router.get('/profile', authPage, (req, res)=>{
    res.render('profile', { fullname: req.session.fullname, role: req.session.role })
})
router.get('/settings', authPage, (req, res)=>{
    res.render('settings', { fullname: req.session.fullname, role: req.session.role })
})
router.get('/breaking', (req, res) => {
  res.render('breaking', { fullname: req.session.fullname, role: req.session.role })
});
router.get('/activity', (req, res) => {
  res.render('activity');
});
router.get('/add', authPage, (req, res)=>{
    res.render('add', { fullname: req.session.fullname, role: req.session.role })
})
module.exports = router;