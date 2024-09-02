function checkToken(req, res, next) {

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]

    if(!token) {
        return res.status(401).json({ msg: 'acesso negado'})
    }

    try {

        const secret = process.env.JWT_SECRET
        jwt.verify(token, secret)

        next()

    } catch {
        res.status(400).json({ msg: 'Token invalido'})
    }
}

module.exports = checkToken;