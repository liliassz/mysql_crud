const { hash } = require('bcrypt');

async function hashPassword(req, res, next) {
    try {
        req.body.hashedPassword = await hash(req.body.password, 10);
        next();
    } catch (error) {
        console.error("Erro ao criptografar a senha:", error);
        return res.status(500).json({ message: 'Erro ao criptografar a senha:', error: error.message });
    }
}

module.exports = hashPassword;