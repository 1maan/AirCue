function authPage (req, res, next){
    if(req.session.userID){
        return next();
    }
    return res.redirect('/login')
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