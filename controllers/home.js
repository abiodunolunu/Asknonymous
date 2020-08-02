exports.getHomePage =  (req, res, next) => {
    let flash = req.flash();
    let length = Object.keys(flash).length;
    let flashType;
    let flashContent;
    if (length > 0) {
        flashType = Object.keys(flash)[0];
        flashContent = flash[flashType][0];
    } else {
        flashType = null;
        flashContent = null;
    }
    res.render('main/index', {
        pageTitle: 'ABiodun',
        path: '/index',
        flashType,
        flashContent
    })
}