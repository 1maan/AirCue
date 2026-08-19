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

module.exports = { blockUser , authPage }