const jwt = require('jsonwebtoken')

exports.generateToken =  generateToken = (payload) => {
    return jwt.sign(payload, process.env.JSON_SECRET_KEY)
}


