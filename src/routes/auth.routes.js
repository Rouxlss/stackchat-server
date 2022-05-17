const { Router } = require('express');
const router = Router();
const { register, verifyCode, login, logout } = require('../controllers/auth.controller');

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

router.route('/register')
    .post(register);

router.route('/verifycode')
    .put(verifyCode);

router.route('/login')
    .post(login);

router.route('/logout')
    .delete(access, logout);

module.exports = router;