const path = require("path");
const fs = require('fs')
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const bodyParser = require('body-parser');
const csrf = require('csurf');
const flash = require('connect-flash');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require("compression");
const homeRoute = require('./routes/home');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const errorController = require('./controllers/error');
const config = require('./config')
const User = require('./models/User');


const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'})
app.use(helmet())
app.use(morgan('combined', {stream: accessLogStream}))

const store = new MongoDBStore({
    uri: config.MONGOURI,
    collection: 'sessions',
    // expires: '3600'
})

const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views')
app.use(flash())
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(express.static(path.join(__dirname, 'public')));
app.use(compression())
app.use(session({
    secret: config.sessionSecret, resave: false, saveUninitialized: false, store: store
}))
app.use(csrfProtection)

app.use((req, res, next) => {
    if(req.path === '/favicon.ico') {
    }
    next()
})

app.use( async (req, res, next) => {
    try {
        if (!req.session.user) {
            return next()
        }
       const user = await User.findById(req.session.user._id)
       if(user) {
           req.user = user
           next()
       }    
    } catch (error) {
        console.log(error)
    }
   
})
app.use((req, res, next) => {
    res.locals.moment = require('moment');
    res.locals.authenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    res.locals.user = req.user
    next()
})

app.use(homeRoute);
app.use(authRoutes);
app.use(messageRoutes);

app.get('/500', errorController.page500);

app.use((error, req, res, next) => {
    res.status(error.statusCode).render("error/500", {
        pageTitle: "Database Error",
        path: "DB Error",
        authenticated: req.session.isLoggedIn
    });
});

app.get('*', (req, res, next) => {
    res.render('error/404', {
        pageTitle: 'Error 404: Page Not Found',
        path: 404,
        authenticated: req.session.isLoggedIn
    })
});

const PORT = process.env.PORT || 3000;
mongoose.connect(config.MONGOURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(result => {
    app.listen(PORT)
    console.log('Connected at ' + PORT)
})
