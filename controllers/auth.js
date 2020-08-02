const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");
const {GoogleClientID, GoogleClientSecret, GoogleRefreshToken, GoogleUserEmail } = require('../config');
const myAccessToken = require("../middleware/mail");
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
       type: "OAuth2",
       user: GoogleUserEmail,
       clientId: GoogleClientID,
       clientSecret: GoogleClientSecret,
       refreshToken: GoogleRefreshToken,
       accessToken: myAccessToken
    }
});

exports.showLoginForm = (req, res, next) => {
    if (req.session.isLoggedIn) {
        req.flash('error', `You are logged in already, Logout first to change user`)
        return res.redirect('/')
    }
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
    res.render("auth/login", {
        pageTitle: "Signin",
        path: "/login",
        flashType: flashType,
        flashContent: flashContent,
        oldInput: {
            email: "",
            password: "",
        },
    });
};

exports.showSignupForm = (req, res, next) => {
    if (req.session.isLoggedIn) {
        req.flash('error', `You are logged in already, Logout first to proceed`)
        return res.redirect('/')
    }
    res.render("auth/signup", {
        pageTitle: "SignUp to continue ...",
        path: "/signup",
        errorMessage: "",
        oldInput: {
            firstname: "",
            lastname: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
        validationErrors: [],
    });
};

exports.postSignup = async (req, res, next) => {
    const { firstname, lastname, email, password, confirmPassword } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render("auth/signup", {
            pageTitle: "SignUp to continue ...",
            path: "/signup",
            errorMessage: errors.array()[0].msg,
            oldInput: {
                firstname: firstname,
                lastname: lastname,
                email: email,
                password: password,
                confirmPassword: confirmPassword,
            },
            validationErrors: errors.array(),
        });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new User({
            firstname: firstname,
            lastname: lastname,
            fullname: `${lastname} ${firstname}`,
            email: email,
            password: hashedPassword,
        });
        await newUser.save();
        req.flash("success", "Registration successful, Login now");
        res.redirect("/login");
    } catch (err) {
        const error = new Error(err)
        error.statusCode = 500
        return next(error)
    }

};

exports.postLogin = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.render("auth/login", {
                pageTitle: "Signin",
                path: "/login",
                flashType: "error",
                flashContent: "Invalid email or password",
                oldInput: {
                    email: email,
                    password: password,
                },
            });
        }
        const isPasswordMatched = await bcrypt.compare(password, user.password);
        if (!isPasswordMatched) {
            return res.render("auth/login", {
                pageTitle: "Signin",
                path: "/login",
                flashType: "error",
                flashContent: "Invalid email or password",
                oldInput: {
                    email: email,
                    password: password,
                },
                // message: message
            });
        }
        req.session.user = user;
        req.session.isLoggedIn = !0;
        return req.session.save((err) => {
            res.redirect("/messages");
        });
    } catch (err) {
        const error = new Error(err)
        error.statusCode = 500
        return next(error)
    }
};

exports.logOut = (req, res, next) => {
    req.session.destroy((err) => {
        res.redirect("/");
    });
};

exports.showResetForm = (req, res, next) => {
    if (req.session.isLoggedIn) {
        req.flash('error', `You are logged in already, Logout first to change user`)
        return res.redirect('/')
    }
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
    res.render("auth/reset", {
        path: "/reset",
        pageTitle: "Reset password",
        oldInput: {
            email: "",
        },
        flashType: flashType,
        flashContent: flashContent,
    });
};

exports.postReset = async (req, res, next) => {
    if (req.session.isLoggedIn) {
        req.flash('error', `You are logged in already, Logout first to change user`)
        return res.redirect('/')
    }
    const { email } = req.body;
    const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render("auth/reset", {
            path: "/reset",
            pageTitle: "Reset password",
            oldInput: {
                email: email,
            },
            flashType: 'error',
            flashContent: 'Enter a valid email address!',
        });
    }

    try {
        const buffer = await crypto.randomBytes(32);
        const token = buffer.toString("hex");
        if (!token) {
            return res.redirect("/reset");
        }
        const user = await User.findOne({ email: email })
        if (!user) {
            req.flash("error", "No account with that email found");
            return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        await user.save();
        req.flash('success', 'check you email inbox to proceed')
        res.redirect("/reset");
        transporter.sendMail({
            from: "Abeydev <donotreply@asknoymous.com>'",
            to: email,
            subject: "Password Reset",
            html: `<p style='color: green';>You requested a password change</p>
            <p>Click <a href="${fullUrl}/${token}">here</a>  to proceed.</p>`,
        })
            .then((res) => {
                console.log('Message delivered with code %s %s', res.response);
            })
            .catch(err => {
                console.log('Errors occurred, failed to deliver message');
                if (err.response && err.response.body && err.response.body.errors) {
                    err.response.body.errors.forEach(error => console.log('%s: %s', error.field, error.message));
                } else {
                    console.log(err);
                }
            });
    } catch (err) {
        console.log(err)
        const error = new Error(err)
        error.statusCode = 500
        return next(error)
    }
};

exports.getNewPassword = async (req, res, next) => {
    if (req.session.isLoggedIn) {
        req.flash('error', `You are logged in already, Logout first to change user`)
        return res.redirect('/')
    }
    const token = req.params.token;
    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiration: {
                $gt: Date.now(),
            },
        });
        if (!user) {
            req.flash("error", "LOL NAH!");
            return res.redirect("/login");
        }
        res.render("auth/new-password", {
            path: "/new-password",
            pageTitle: "Enter new password",
            errorMessage: "",
            userId: user._id.toString(),
            resetToken: token,
            validationErrors: []
        });
    } catch (err) {
        const error = new Error(err)
        error.statusCode = 500
        return next(error)
    }
};

exports.postNewPassword = async (req, res, next) => {
    const { newPassword, confirmNewPassword, resetToken, userId } = req.body;
    if (req.session.isLoggedIn) {
        req.flash('error', `You are logged in already, Logout first to change user`)
        return res.redirect('/')
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(newPassword, confirmNewPassword)
        return res.render("auth/new-password", {
            path: "/new-password",
            pageTitle: "New Password",
            userId: userId.toString(),
            resetToken: resetToken,
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
        });
    }
    const fullUrl = req.protocol + '://' + req.get('host');
    try {
        const user = await User.findOne({
            resetToken: resetToken,
            resetTokenExpiration: {
                $gt: Date.now(),
            },
            _id: userId,
        });

        if (!user) {
            req.flash("error", "User not found or Token Expired, Try Again");
            res.redirect("/login");
        }
        const newHashedPassword = await bcrypt.hash(newPassword, 12);
        user.password = newHashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        await user.save();
        req.flash("success", "password changed successfully, Login!");
        res.redirect("/login");
        await transporter.sendMail({
            from: "abeydev@asknoymous.com",
            to: user.email,
            subject: "Password changed successful",
            html: `<p style='color: green';>Your password has been reset successfully</p>
                    <p>Click <a href="${fullUrl}/login">here</a>  to login again.</p>`,
        });
    } catch (err) {
        const error = new Error(err)
        error.statusCode = 500;
        return next(error)
    }
};
