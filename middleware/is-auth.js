module.exports = (req, res, next) => {
    // console.log('wow')
    // console.log(req.session.user)
    if (!req.session.isLoggedIn) {
        console.log('not reaching')
        return res.render('auth/login', {
            pageTitle: 'Signin',
            path: '/login',
            flashType: null,
            flashContent: null,
            oldInput: {
                email: '',
                password: ''
            }
        })
    }
    if ((req.originalUrl == '/login') && (req.session.isLoggedIn == true)) {
        console.log('yes')
        return res.redirect('/')
    }
    next()
}