
const randomize = require('randomatic');
const { setSessionTokenKey, removeToken, sendCode, getKey } = require('../utils/redis');
const { createSessionToken } = require('./../utils/jwt');
const { sendVerificationCode } = require('./../utils/twilio');

authCtrl = {};

const User = require('../models/user.model');

const generateToken = (id) => {

    const token = createSessionToken(id);

    setSessionTokenKey(
        `{${id}}{SESSION-APP}{${token}}`,
        token,
        (error) => {
            if (error) {
                console.log(error)
            }
        }
    );

    return token;

}

authCtrl.register = async (req, res) => {

    try {

        const { name, country_code, number } = await req.body;

        if(!name) {
            return res.status(400).json({
                ok: false,
                message: 'Name is required',
            });
        }

        if(!country_code) {
            return res.status(400).json({
                ok: false,
                message: 'Country code is required',
            });
        }
        if(!number) {
            return res.status(400).json({
                ok: false,
                message: 'Number is required',
            });
        }

        const user = await User.findOne({ number });

        if (user) {
            return res.status(400).json({
                message: 'User already exists',
                error: true
            });
        }

        const code = (randomize('0', 6));

        sendVerificationCode(code, country_code, number);
        
        const newUser = await new User({ name, country_code, number, userNumber: `${country_code}${number}` });
        await newUser.save();

        const id = newUser._id.toString();
        sendCode(`{${id}}{CODE}`, code);
        
        return res.status(200).json({
            message: 'Code sent successfull',
            error: false
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error processing the request: ' + error.message,
            error: true
        });
    }
}

authCtrl.verifyCode = async (req, res) => {

    try {

        const { code, number } = await req.body;
        const user = await User.findOne({ userNumber: number });

        console.log(user);

        if (!user) {
            return res.status(400).json({
                message: 'User does not exist',
                error: true
            });
        }

        const userId = user._id.toString();
        const key = `{${userId}}{CODE}`;

        const codeFromRedis = await getKey(key);

        console.log('codeFromRedis', key);

        if (codeFromRedis !== code) {
            return res.status(400).json({
                message: 'Invalid code',
                error: true
            });
        }

        removeToken(key);

        if (user.status != 'active') {
            user.status = 'active';
            user.save();
        }

        const token = generateToken(user._id.toString());

        return res.status(200).json({
            message: 'Code verified successfull',
            token,
            id: user._id.toString(),
            error: false
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error processing the request: ' + error.message,
            error: true
        });
    }
}

authCtrl.login = async (req, res) => {

    try {

        const { country_code, number } = await req.body;
        const user = await User.findOne({ userNumber: `${country_code}${number}` });
        if (!user) {
            return res.status(400).json({
                message: 'User does not exist',
                error: true
            });
        }
        const code = (randomize('0', 6));

        sendVerificationCode(code, country_code, number);

        const id = user._id.toString();
        sendCode(`{${id}}{CODE}`, code);

        res.status(200).json({
            message: 'Code sent successfull',
            error: false
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error processing the request: ' + error.message,
            error: true
        });
    }

}

authCtrl.logout = (req, res,) => {

    try {
        const userId = req.user_id;
        const accessToken = req.accessToken;

        const key = `{${userId}}{SESSION-APP}{${accessToken}}`;
        removeToken(key);

        return res.status(200).json({
            message: 'Logout successfull',
            error: false
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error processing the request: ' + error.message,
            error: true
        });
    }

}

module.exports = authCtrl;