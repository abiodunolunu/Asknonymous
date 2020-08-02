const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const User = require('../models/User');
const isAuth = require('../middleware/is-auth');
const authController = require('../controllers/auth');

router.get('/login', authController.showLoginForm);

router.get('/signup', authController.showSignupForm);

router.post('/signup', [
    check("email")
        .isEmail()
        .withMessage('Enter a valid email address')
        .custom(async (value, { req }) => {
            try {
                const user = await User.findOne({ email: value })
                if (user) {
                    return Promise.reject("Email exist already, please pick a different one")
                }
            } catch (error) {
                throw error
            }
        }),
    check('password')
        .isLength({
            min: 6
        })
        .withMessage('password must be at least 6 characters long'),
    check('confirmPassword').custom((value, {
        req
    }) => {
        if (value !== req.body.password) {
            throw new Error("passwords have to match!")
        }
        return !0
    })
], authController.postSignup)

router.post("/login", authController.postLogin)

router.get("/logout", authController.logOut)

router.get('/reset', authController.showResetForm)

router.post('/reset', [
    check("email")
        .isEmail()
        .withMessage('Enter a valid email address')
], authController.postReset)

router.get("/reset/:token", authController.getNewPassword)

router.post("/new-password", [
    check('newPassword')
        .isLength({
            min: 6
        })
        .withMessage('password must be at least 6 characters long'),
    check('newPassword').custom((value, {
        req }) => {
        if (value !== req.body.confirmNewPassword) {
            throw new Error("passwords have to match!")
        }
        return !0
    })
], authController.postNewPassword)

module.exports = router