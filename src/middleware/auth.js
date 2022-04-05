const jwt = require('jsonwebtoken')

exports.validate =  validate = (req, res, next) => {
    const authorizationHeader = req.headers.authorization

    if (authorizationHeader) {
        const token = req.headers.authorization.split(' ')[1];
        try {
            result = jwt.verify(token, process.env.JSON_SECRET_KEY)
            req.decoded = result
            next()
        } catch (error) {
            throw new Error(error)
        }
    } else {
        result = { 
            error: `Authentization error. Token required.`,
            status: 401
        };
        res.send(result);
    }

    return authorizationHeader;
}