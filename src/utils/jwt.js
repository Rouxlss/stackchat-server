const jwt = require('jsonwebtoken');

const jsonwebtoken = {};

jsonwebtoken.createSessionToken = (id) => {
    const token = jwt.sign(
        { id },
        process.env.JWT_SECRET, 
        // {expiresIn: parseInt(process.env.JWT_ACCESS_TTL),}
    );
    return token;
}

module.exports = jsonwebtoken;
