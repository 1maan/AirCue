const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const db = require('../config/db');
const { authPage } = require('../config/auth');



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

// STORIES PAGE

router.post('/stories', (req, res)=>{
    const { slug, language, cg_text, story_text } = req.body;
    const date = req.query.date;
    if(!slug || !language || !cg_text || !story_text){
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (!date || !date.trim()) {
        return res.status(400).json({ success: false, message: 'Date is required' });
    }
    const created_by = req.session.userID;

    if (!created_by) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const sql = `INSERT INTO stories ( slug, language, cg_text, story_text, created_by, story_date) VALUES (?, ?, ?, ?, ?, ?)`;

     db.query(
        sql, [ slug.trim(), language, cg_text.trim(), story_text.trim(), created_by, date], (err, result) => {
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


// RUN ORDERS PAGE

router.post('/run-orders', (req, res) => {
    const { name, run_date, air_time } = req.body;
    const created_by = req.session.userID;
    if (!name || !run_date || !air_time || !created_by) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const sql = `INSERT INTO run_orders ( name, run_date, air_time, created_by ) VALUES (?, ?, ?, ?)`;

    db.query( sql, [ name.trim(), run_date, air_time , created_by ], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: 'Database error' });
            }
            return res.status(201).json({ success: true, message: 'Run order created successfully', runOrderId: result.insertId });
        }
    );
});

router.get('/run-orders', (req, res) => {
    const date = req.query.date;
    if (!date) {
        return res.status(400).json({ success: false, message: 'Date query parameter is required' });
    }
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
    db.query(sql, [date], (err, result)=>{
        if(err){
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        return res.status(200).json({ success: true, stories: result })
    })
});

router.put('/run-orders/:id/active', (req, res) => {
    const id = req.params.id;
    const sql = `
        UPDATE run_orders
        SET status = CASE
            WHEN id = ? THEN 'live'
            WHEN status = 'live' THEN 'completed'
            ELSE status
        END
        WHERE id = ? OR status = 'live'
    `;
    db.query(sql, [id, id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        return res.status(200).json({ success: true, message: 'Rundown is now active' });
    });
});

router.get('/run-orders/active', (req, res) => {
    const id = req.params.id;
    const sql = `
        SELECT * FROM run_orders WHEN id = ? OR status = 'live'
    `;
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        return res.status(200).json({ success: true, message: 'Rundown Fetched' });
    });
});

router.get('/run-order', (req, res) => {
    const orderID = req.query.id;
    if (!orderID) {
        return res.status(400).json({ success: false, message: 'Date query parameter is required' });
    }
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
    WHERE ro.id = ?
    ORDER BY air_time
    LIMIT 1
    `;
    db.query(sql, [orderID], (err, result)=>{
        if(err){
            return res.status(500).json({ success: false, message: 'Database error' });
        }


        const allUsersPro = "SELECT id, full_name FROM users WHERE role != 'admin'"

        db.query(allUsersPro, (err2, result2)=>{
            if(err2){
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            return res.status(200).json({ success: true, stories: result, users: result2})
        })


    })
});

router.put('/run-orders/:id', (req, res) => {
    const id = req.params.id;
    const { name, run_date, air_time, producer_id } = req.body;
    if (!name || !run_date || !air_time) {
        return res.status(400).json({ success: false, message: 'Name, date and airtime are required' });
    }
    const sql = `
        UPDATE run_orders
        SET
            name = ?,
            run_date = ?,
            air_time = ?,
            producer_id = ?
        WHERE id = ?
    `;
    db.query(
        sql,[ name.trim(), run_date, air_time, producer_id || null, id], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: 'Database error' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Rundown not found' });
            }
            return res.status(200).json({ success: true, message: 'Rundown updated successfully' });
        }
    );
});

router.delete('/run-orders/:id', (req, res) => {
    const id = req.params.id;
    const sql = `DELETE FROM run_orders WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Rundown not found' });
        }
        return res.status(200).json({ success: true, message: 'Rundown deleted successfully' });
    });
});

router.get('/run-order/live', (req, res) => {
    const sql = `
        SELECT * FROM run_orders WHERE status = 'live';
    `;
    db.query(sql, (err, result)=>{
        if(err){
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        return res.status(200).json({ success: true, nextNews: result })
    })
});

router.post('/run-order/save', (req, res) => {

    const { run_order_id, data } = req.body;

    if (!run_order_id || !data) {
        return res.status(400).json({
            success: false,
            message: 'Run order and items are required'
        });
    }

    const values = Object.keys(data).map(position => {

        const item = data[position];

        if (item.type === 'STORY') {
            return [
                run_order_id,
                'story',
                item.id,
                null,
                Number(position)
            ];
        }

        if (item.type === 'BREAK') {
            return [
                run_order_id,
                'break',
                null,
                item.text,
                Number(position)
            ];
        }

    }).filter(Boolean);


    db.getConnection((err, connection) => {

        if (err) {
            console.error(err);

            return res.status(500).json({
                success: false,
                message: 'Database connection error'
            });
        }


        connection.beginTransaction(err => {

            if (err) {
                connection.release();

                return res.status(500).json({
                    success: false,
                    message: 'Database error'
                });
            }


            connection.query(
                'DELETE FROM run_order_items WHERE run_order_id = ?',
                [run_order_id],
                (err) => {

                    if (err) {

                        return connection.rollback(() => {

                            connection.release();

                            console.error(err);

                            res.status(500).json({
                                success: false,
                                message: 'Unable to save rundown'
                            });

                        });

                    }


                    if (values.length === 0) {

                        return connection.commit(err => {

                            if (err) {

                                return connection.rollback(() => {

                                    connection.release();

                                    res.status(500).json({
                                        success: false,
                                        message: 'Unable to save rundown'
                                    });

                                });

                            }

                            connection.release();

                            return res.status(200).json({
                                success: true,
                                message: 'Rundown saved successfully'
                            });

                        });

                    }


                    const sql = `
                        INSERT INTO run_order_items
                        (
                            run_order_id,
                            item_type,
                            story_id,
                            break_name,
                            position
                        )
                        VALUES ?
                    `;


                    connection.query(sql, [values], (err) => {

                        if (err) {

                            return connection.rollback(() => {

                                connection.release();

                                console.error(err);

                                res.status(500).json({
                                    success: false,
                                    message: 'Unable to save rundown'
                                });

                            });

                        }


                        connection.commit(err => {

                            if (err) {

                                return connection.rollback(() => {

                                    connection.release();

                                    console.error(err);

                                    res.status(500).json({
                                        success: false,
                                        message: 'Unable to save rundown'
                                    });

                                });

                            }

                            connection.release();

                            return res.status(200).json({
                                success: true,
                                message: 'Rundown saved successfully'
                            });

                        });

                    });

                }
            );

        });

    });

});

router.get('/run-order/:id', authPage, (req, res) => {

    const id = req.params.id;

    const sql = `
        SELECT roi.*, s.slug, s.created_at as ca
        FROM run_order_items roi
        LEFT JOIN stories s
        ON 
        roi.story_id = s.id
        WHERE run_order_id = ?
        ORDER BY position ASC;
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.error(err);
            return res.redirect('/500');
        }

        const runDown = result;

        return res.status(200).json({ success: true, message: 'Rundown Updated', result: result });

    });

});

router.post('/controller-settings/save', authPage, (req, res) => {
    const {
        name,
        text_size,
        line_height,
        side_margin,
        mirror,
        is_active = true,
    } = req.body;
    console.log(text_size, line_height)
    const created_by = req.session?.userID;

    if (!created_by) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Setting name is required' });
    }

    const insertSql = `
        INSERT INTO teleprompter_settings (name, text_size, line_height, side_margin, mirrowed, is_active, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query('UPDATE teleprompter_settings SET is_active = 0 WHERE is_active = 1', (updateErr) => {
        if (updateErr) {
            console.error('Deactivate previous teleprompter settings error:', updateErr);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        db.query(insertSql, [
            name.trim(),
            text_size ?? null,
            line_height ?? null,
            side_margin,
            mirror,
            is_active,
            created_by
        ], (err, result) => {
            if (err) {
                console.error('Save teleprompter settings error:', err);
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            return res.status(201).json({
                success: true,
                message: 'Settings saved successfully',
                settingsId: result.insertId
            });
        });
    });
});

module.exports = router;