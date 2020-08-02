exports.page404 = (req, res, next) => {
    res.status(404).render("error/404", {
        pageTitle: "Page Not Found",
        path: "Error",
        authenticated: req.session.isLoggedIn
    });
};
exports.page500 = (req, res, next) => {
    res.status(500).render("error/500", {
        pageTitle: "Database Error",
        path: "DB Error",
        authenticated: req.session.isLoggedIn
    });
};