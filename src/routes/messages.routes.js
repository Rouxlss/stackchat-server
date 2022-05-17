const { Router } = require('express');
const router = Router();

const {
    validateExistenceAccessHeader,
    validateSession,
    validateTokenAlive,
} = require('./../middlewares');

const access = [
    validateExistenceAccessHeader,
    validateSession,
    validateTokenAlive,
]

const { sendMessage, getMessages, deleteMessage, getRecientChats } = require('../controllers/messages.controller');

router.route('/sendMessage/:receiverId')
    .post(access, sendMessage);

router.route('/getMessages/:receiverId')
    .get(access, getMessages);

router.route('/getRecientChats')
    .get(access, getRecientChats);

router.route('/deleteMessage/:messageId/:state')
    .delete(access, deleteMessage)

module.exports = router;
