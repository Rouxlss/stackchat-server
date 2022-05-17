const { getKey } = require('../utils/redis');

const validateAccessToken = async (req, res, next) => {

    const { accessToken, user_id } = req;

    const key = `{${user_id}}{SESSION-APP}{${accessToken}}`;
    const validKey = await getKey(key);

    if (!validKey) {
        return res.status(403).json({ 
            requestId: req.id, code: 403, message: 'Invalid access token' }
        );
    }

    req.authToken = validKey;
    req.key = key;
    next();

};

module.exports = validateAccessToken;