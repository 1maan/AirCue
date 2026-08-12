const express = require('express');
const router = express.Router();

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
router.get('/runorders', authPage, (req, res)=>{
    res.render('runorders', { fullname: req.session.fullname, role: req.session.role })
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