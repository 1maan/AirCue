const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const db = require('../config/db');
const { authPage } = require('../config/auth');
require('dotenv').config();



function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}
function validatePassword(password) {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

    return re.test(password);
}

router.post('/add-user', async (req, res)=>{
    const { fullname, email, username, password, role } = req.body
    if(!fullname || !email || !username || !email || !password || !role){
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if(!validateEmail(email)){
        return res.status(400).json({ success: false, message: 'Invalid email address' });
    }
    if(!validatePassword(password)){
        return res.status(400).json({ success: false, message: 'Password does not meet complexity requirements' });
    }
    if(role != "journalist" && role != "producer" && role != "presenter"){
        return res.status(400).json({ success: false, message: 'Invalid user role' });
    }
    const checkUnique = "SELECT username, email FROM users WHERE username = ? OR email = ?"
    db.query(checkUnique, [username, email], (UniqueError, UniqueResult)=>{
        if(UniqueError){
            return res.status(500).json({ success: false, message: 'Database error. Please try again later.' });
        }
        if(UniqueResult.length > 0){
            return res.status(409).json({ success: false, message: 'Username or email already in use' });
        }
        const newUserSql = "INSERT INTO users (full_name, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?)"
        bcrypt.hash(password, saltRounds, (hashError, hashPass)=>{
             if (hashError) {
                console.error(bcryptError);
                return res.status(500).json({ success: false, message: 'Authentication error' });
            }
            db.query(newUserSql, [fullname, username, email, hashPass, role], (err, result)=>{
                if(err){
                    return res.status(500).json({ success: false, message: 'Database error. Please try again later.' });
                }
                return res.status(200).json({ success: true, message: 'User added successfully' });
            })
        })
    })
})

router.delete('/remove-user', (req, res)=>{
    const { username, email } = req.body;
    const checkInfo = "DELETE FROM users WHERE username = ? AND email = ?"
    db.query(checkInfo, [username, email], (err, result)=>{
        if(err){
            return res.status(500).json({ success: false, message: 'Database error. Please try again later.' });
        }  
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        return res.status(200).json({ success: true, message: 'User removed successfully' });
    })
})

router.post('/login', (req, res)=>{
    const { username, password } = req.body;
    if( !username || !password ){
        return res.status(400).json({ success: false, message: 'Username and password are required' });
    }
    if(!validatePassword(password)){
        return res.status(400).json({ success: false, message: 'Password does not meet complexity requirements' });
    }
    const checkDet = "SELECT id, full_name, role, password_hash FROM users WHERE username = ? LIMIT 1"
    db.query(checkDet, username, (err, result)=>{
        if(err){
            return res.status(500).json({ success: false, message: 'Database error. Please try again later.' });
        }
        if(result.length === 0){
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
        bcrypt.compare(password, result[0].password_hash, (berror, bresult)=>{
            if(berror){
                return res.status(500).json({ success: false, message: 'Authentication error' });
            }
            if(!bresult){
                return res.status(401).json({ success: false, message: 'Invalid username or password' });
            }

            req.session.userID = result[0].id
            req.session.fullname = result[0].full_name
            req.session.role = result[0].role
            
            return res.status(200).json({ success: true, message: 'User logged in successfully' });
        })
    })
})

router.post('/logout', (req, res)=>{
    req.session = null;
    if(!req.session) {
        return res.json({ success: true });
    } else {
        return res.status(500).json({ success: false, error: 'Failed to destroy session' });
    }
})

router.post('/stories', (req, res)=>{
    const { slug, language, cg_text, story_text } = req.body;

    if(!slug || !language || !cg_text || !story_text){
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const created_by = req.session.userID;

    if (!created_by) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const sql = `INSERT INTO stories ( slug, language, cg_text, story_text, created_by ) VALUES (?, ?, ?, ?, ?)`;

     db.query(
        sql, [ slug.trim(), language, cg_text.trim(), story_text.trim(), created_by], (err, result) => {
            if (err) {
                console.error('Story insert error:', err);
                return res.status(500).json({ success: false, message: 'Database error' });
            }
            return res.status(201).json({ success: true, message: 'Story added successfully', storyId: result.insertId });
        }
    );
})

router.get('/stories', (req, res) => {
    const date = req.query.date;
    let language = req.query.lan;

    if(!language){
        language = 'dv';
    }

    const sql = `
        SELECT 
            id,
            story_date,
            slug,
            language,
            cg_text,
            story_text,
            status,
            created_by,
            created_at,
            updated_at
        FROM stories
        WHERE story_date = ?
        AND language = ?
        ORDER BY created_at DESC
    `;

    db.query(sql, [date, language], (err, result) => {
        if (err) {
            console.error(err);

            return res.status(500).json({ success: false, message: 'Database error' });
        }
        return res.status(200).json({ success: true, stories: result });
    });
});

router.get('/stories/search', (req, res) => {

    const { q, date, lan } = req.query;

    if (!date || !date.trim()) {
        return res.status(400).json({ success: false, message: 'Date is required' });
    }
    if(!lan){
        lan = 'dv';
    }
    const search = `%${q.trim()}%`;

    const sql = `
        SELECT
            id,
            story_date,
            slug,
            language,
            cg_text,
            story_text,
            status,
            created_by,
            created_at,
            updated_at
        FROM stories
        WHERE story_date = ?
        AND language = ?
        AND (
            slug LIKE ?
            OR cg_text LIKE ?
        )
        ORDER BY created_at DESC
    `;

    db.query(sql, [date, lan, search, search], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        return res.status(200).json({ success: true, stories: result });
    });

});


router.put('/stories/:id', authPage, (req, res) => {

    const id = req.params.id;
    const { slug, language, cg_text, story_text } = req.body;

    if (!slug || !language || !cg_text || !story_text) {
        return res.status(400).json({ success: false, message: 'All fields are required'});
    }

    const sql = `
        UPDATE stories
        SET 
            slug = ?,
            language = ?,
            cg_text = ?,
            story_text = ?
        WHERE id = ?
    `;

    db.query(sql, [slug, language, cg_text, story_text, id], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Story not found' });
            }

            return res.status(200).json({ success: true, message: 'Story updated successfully' });
        }
    );
});











module.exports = router;