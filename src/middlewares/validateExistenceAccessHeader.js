
const validateAccessHeader = (req, res, next)=>{

    const accessHeader = req.headers.authorization;
    if (!accessHeader) {
        return res
            .status(422)
            .json({ requestId: req.id, code: 422, message: 'Access header is missing'});
    }
    const [,accessToken] = accessHeader.split(' ');
    req.accessToken = accessToken;
    next();
};

module.exports = validateAccessHeader;