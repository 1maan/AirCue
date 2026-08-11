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
router.get('/breaking', (req, res)=>{
    res.render('breaking')
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
    res.render('dashboard')
})
router.get('/runorders', (req, res)=>{
    res.render('runorders')
})

router.get('/stories', (req, res)=>{
    res.render('stories')
})

router.get('/controller', (req, res)=>{
    res.render('controller')
})

module.exports = router;