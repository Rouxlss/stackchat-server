const jwt = require('jsonwebtoken');

const validateSession = (req, res, next) => {
    const  {accessToken} = req;

    jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            if(err.name === 'TokenExpiredError') {
                return res
                    .status(401)
                    .json({ requestId: req.id, code: 401});
            }
            return res
            .status(500)
            .json({ requestId: req.id, code: 500, message: err.message });
        }
        req.user_id = user.id;
        next();
    });

};

module.exports =  validateSession;