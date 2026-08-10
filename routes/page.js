const express = require('express');
const router = express.Router();

router.get('/', (req, res)=>{
    res.render('Dashboard')
})
router.get('/login', (req, res)=>{
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


module.exports = router;