const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { blockUser , authPage } = require('../config/auth');

router.get('/', (req, res)=>{
    res.redirect('/stories')
})
router.get('/login', blockUser , (req, res)=>{
    res.render('login')
})
router.get('/teleprompter', (req, res)=>{
        const sql = `
        SELECT * FROM run_orders WHERE status = 'live' LIMIT 1;

        SELECT 
            roi.*,
            s.slug,
            s.cg_text,
            s.story_text,
            s.created_at AS ca
        FROM run_orders ro
        INNER JOIN run_order_items roi
            ON roi.run_order_id = ro.id
        LEFT JOIN stories s
            ON roi.story_id = s.id
        WHERE ro.status = 'live'
        ORDER BY roi.position ASC;
    `;
    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);
            return res.redirect('/500');
        }
        console.log(result[0])
        res.render('teleprompter', {
            runDownInfo: result[0][0],
            runDown: result[1]
        });

    });
})
function formatDatabaseDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
router.get('/runorders', authPage, (req, res)=>{
    const date = new Date();
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
    ORDER BY air_time;

    SELECT * FROM run_orders WHERE status = 'live';
    `;
    db.query(sql, [formatDatabaseDate(date)], (err, result)=>{
        if(err){
            return res.redirect('/500')
        }
        res.render('runorders', { fullname: req.session.fullname, role: req.session.role, runorders: result[0], nextNews: result[1][0] })
    })
})
router.get('/runorder/:id', authPage, (req, res) => {

    const id = req.params.id;

    const sql = `
        SELECT 
            ro.*,
            COALESCE(u.full_name, 'No Producer') AS full_name
        FROM run_orders ro
        LEFT JOIN users u 
            ON ro.producer_id = u.id
        WHERE ro.id = ?
        LIMIT 1;

        SELECT *
        FROM run_orders
        WHERE id = ?
        AND status = 'live'
        LIMIT 1;

        SELECT roi.*, s.slug, s.created_at as ca
        FROM run_order_items roi
        LEFT JOIN stories s
        ON 
        roi.story_id = s.id
        WHERE run_order_id = ?
        ORDER BY position ASC;
    `;

    db.query(sql, [id, id, id], (err, result) => {

        if (err) {
            console.error(err);
            return res.redirect('/500');
        }

        if (result[0].length === 0) {
            return res.redirect('/404');
        }

        const runOrder = result[0][0];
        const isActive = result[1].length > 0;
        const runDown = result[2];

        res.render('runorders-id', { fullname: req.session.fullname, role: req.session.role, runOrder, isActive, runDown: runDown });

    });

});
router.get('/stories', authPage, (req, res)=>{
    res.render('stories', { fullname: req.session.fullname, role: req.session.role })
})
router.get('/controller/', authPage, (req, res) => {
    const sql = `
        SELECT 
            roi.*,
            ro.id as ro_id,
            s.slug,
            s.cg_text,
            s.story_text,
            s.created_at AS ca
        FROM run_orders ro

        INNER JOIN run_order_items roi
            ON roi.run_order_id = ro.id

        LEFT JOIN stories s
            ON roi.story_id = s.id

        WHERE ro.status = 'live'

        ORDER BY roi.position ASC
    `;
    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);
            return res.redirect('/500');
        }
        res.render('controller', {
            fullname: req.session.fullname,
            role: req.session.role,
            runDown: result
        });

    });
});
router.get('/controller2/', authPage, (req, res) => {
    res.render('controller2', { fullname: req.session.fullname, role: req.session.role });
});
router.get('/profile', authPage, (req, res)=>{
    res.render('profile', { fullname: req.session.fullname, role: req.session.role })
})
router.get('/settings', authPage, (req, res)=>{
    res.render('settings', { fullname: req.session.fullname, role: req.session.role })
})
router.get('/breaking', (req, res) => {
  res.render('breaking', { fullname: req.session.fullname, role: req.session.role })
});
router.get('/404', authPage, (req, res)=>{
    res.render('error_pages/404')
})

module.exports = router;