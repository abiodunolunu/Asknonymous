const Messages = require('../models/Messages')
const User = require('../models/User')
const { body } = require('express-validator')

exports.getUser = async (req, res, next) => {
    const userId = req.params.id
    try {
        if(userId.length < 24) {
            req.flash('error', 'No user with info found.')
            return res.redirect('/')
        }
        const user = await User.findById(userId)
        if(!user) {
            req.flash('error', 'No user with info found.')
            return res.redirect('/')
        }
        res.render('main/userbox', {
            pageTitle: 'userpage',
            path: '/userbox',
            userId: userId,
            userFullname: user.fullname,
            errorMessage: ''
        })
    } catch (err) {
        const error = new Error(err)
        error.statusCode = 500
        return next(error)
    }
}

exports.getMessges = async (req, res, next) => {
    const page = +req.query.page || 1
    const perPage = 4;
    try {
        const user = await User.findById(req.user._id)
        const totalItems = await Messages.find({ 'text.owner': user._id }).countDocuments();
        const messages = await Messages.find({ 'text.owner': user._id })
            .skip((page - 1) * perPage)
            .limit(perPage)
        res.render('main/messages', {
            pageTitle: 'Messages',
            path: '/messages',
            messages: messages,
            totalItems: totalItems,
            hasNextPage: perPage * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / perPage),
            currentPage: page
        })
    } catch (err) {
        const error = new Error(err)
        error.statusCode = 500
        return next(error)
    }

}
exports.postMessage = async (req, res, next) => {
    const { msg, userId, userFullname } = req.body
    console.log(msg, userId)
    const strArr = msg.split('')
    const final = strArr.filter(s => {
        return s.charCodeAt() !== 32 && s.charCodeAt() !== 10
    })
    if (msg.replace(/\s/g, '') == '') {
        return res.render('main/userbox', {
            pageTitle: 'userpage',
            path: '/userbox',
            userId: userId,
            userFullname: userFullname,
            errorMessage: `You can't send an empty message`
        })
    }
    try {
        if(userId.length < 24) {
            req.flash('error', 'No user with info found.')
            return res.redirect('/')
        }
        const user = await User.findById(userId)
        if (!user) {
            req.flash('error', 'No user with info found.')
            return res.redirect('/')
        }
        const newMessage = new Messages({
            text: {
                content: msg,
                owner: user
            }
        })
        await newMessage.save()
        await user.messages.push(newMessage)
        await user.save()
        req.flash('success', 'Message posted to ' + userFullname)
        res.redirect('/')
    } catch (err) {
        const error = new Error(err)
        error.statusCode = 500
        return next(error)
    }
}