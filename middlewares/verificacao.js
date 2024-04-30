/**
 * @description Verifica se os dados do usuário estão corretos e completos.
 * @param {object} userData - Objeto contendo os dados do usuário a serem verificados.
 * @returns {object} Um objeto contendo a validade da verificação e uma mensagem opcional.
 * @returns {isValid} - Se for 'True' a validalção foi aprovada, se for false ela identificou algum.
 */

const { verificateUser } = require('../utils/funcoes/verificacao');

function validateUser(req, res, next) {
    const userData = req.body;
    const verification = verificateUser(userData);

    if (!verification.isValid) {
        const errors = [];

        // Verifica se o nome de usuário está presente e possui menos de 10 caracteres
        if (!userData.username) {
            errors.push('Nome de usuário é obrigatório.');
        } else if (userData.username.length > 10) {
            errors.push('Nome de usuário deve ter no máximo 10 caracteres.');
        }

        // Verifica se o nome está presente e possui menos de 10 caracteres
        if (!userData.first_name) {
            errors.push('Nome é obrigatório.');
        } else if (userData.first_name.length > 10) {
            errors.push('Nome deve ter no máximo 10 caracteres.');
        }

        // Verifica se o sobrenome está presente e possui menos de 10 caracteres
        if (!userData.last_name) {
            errors.push('Sobrenome é obrigatório.');
        } else if (userData.last_name.length > 10) {
            errors.push('Sobrenome deve ter no máximo 10 caracteres.');
        }

        // Verifica se o email está presente
        if (!userData.email) {
            errors.push('Email é obrigatório.');
        }

        // Verifica se a senha está presente
        if (!userData.password) {
            errors.push('Senha é obrigatória.');
        }

        return res.status(400).json({ message: 'Erro de validação', errors: errors });
    }

    next();
}

module.exports = validateUser;
