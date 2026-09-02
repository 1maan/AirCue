const db = require('./db');

function authPage (req, res, next){
    if(req.session.userID){
        return next();
    }
    return res.status(401).render('error', {
        code: 401,
        title: 'Session Expired',
        label: 'Authentication Required',
        heading: 'Your session has expired.',
        description: 'For security, your AirCue session is no longer active. Sign in again to continue working in the newsroom.'
    });
}
function blockUser (req, res, next){
    if(!req.session || !req.session.userID){
        return next();
    }else{
        return res.redirect('/')
    }
    next();
}

function adminOnly (req, res, next){
    const sql = 'SELECT role FROM users WHERE id = ?';
    db.query(sql, [req.session.userID], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).render('error', {
                code: 500,
                title: 'Internal Server Error',
                label: 'Database Error',
                heading: 'An error occurred while checking user permissions.',
                description: 'Please try again later or contact your administrator.'
            });
        }
        if (results.length > 0 && results[0].role === 'admin') {
            return next();
        }
        return res.status(403).render('error', {
            code: 403,
            title: 'Forbidden',
            label: 'Access Denied',
            heading: 'You do not have permission to access this page.',
            description: 'Please contact your administrator if you believe this is an error.'
        });
    });
}

module.exports = { blockUser , authPage, adminOnly }