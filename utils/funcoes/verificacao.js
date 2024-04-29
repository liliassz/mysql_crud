/**
 * @description Verifica se os dados do usuário estão corretos e completos.
 * @param {object} userData - Objeto contendo os dados do usuário a serem verificados.
 * @returns {object} Um objeto contendo a validade da verificação e uma mensagem opcional.
 * @returns {isValid} - Se for 'True' a validalção foi aprovada, se for false ela identificou algum.
 */

function verificateUser(userData) {

    const { username, first_name, last_name, email, password } = userData;

    if (![username, first_name, last_name, email, password].every(Boolean)) {
        return { isValid: false,  message: 'Nome de usuário, nome, sobrenome, email e senha são obrigatórios' };
    }

    if (username.length > 10) {
        return { isValid: false,  message: 'Seu nome de usuário ultrapassou o limite de 10 caracteres.' };
    }

    if (first_name.length > 10) {
        return { isValid: false,  message: 'Seu nome ultrapassou o limite de 10 caracteres.'  };
    }

    if (last_name.length > 10) {
        return { isValid: false, message: 'Seu sobrenome ultrapassou o limite de 10 caracteres.' };
    }

    return {isValid: true};
}

module.exports = {
    verificateUser
};