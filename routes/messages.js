const express = require('express')
const router = express.Router()
const { check } = require('express-validator')
const isAuth = require('../middleware/is-auth')
const messageControllers = require('../controllers/messages')

router.get('/messages', isAuth, messageControllers.getMessges)

router.get('/u/:id', messageControllers.getUser)

router.post('/messages', messageControllers.postMessage)

module.exports = router