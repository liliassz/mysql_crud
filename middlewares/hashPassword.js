const { hash } = require('bcrypt');

/**
 * Middleware para criar um hash da senha do usuário.
 * @param {object} req - Objeto de requisição Express.
 * @param {object} res - Objeto de resposta Express.
 * @param {function} next - Função de callback para chamar o próximo middleware.
 * @returns {void}
 */
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