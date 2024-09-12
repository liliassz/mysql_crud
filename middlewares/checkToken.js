const jwt = require('jsonwebtoken');

function checkToken(req, res, next) {

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]

    if(!token) {
        return res.status(401).json({ msg: 'acesso negado'})
    }

    try {

        const secret = process.env.JWT_SECRET;
        const decoded = jwt.verify(token, secret);
        req.userId = decoded.id; 
        next();

    } catch {
        res.status(400).json({ msg: 'Token invalido'})
    }
}

module.exports = checkToken;