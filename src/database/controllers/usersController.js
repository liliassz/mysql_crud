// Importa o módulo 'express', que é um framework web para Node.js.
const express = require('express');

// Importa o pool de conexão com o banco de dados configurado.
const pool = require('../config/config');

// Cria uma instância do roteador do Express.
const router = express.Router();

/**
 * @description Rota para buscar um usuário pelo ID.
 * @param {string} req.params.id - O ID do usuário a ser buscado.
 * @returns {Object} - Os detalhes do usuário encontrado.
 */
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const connection = await pool.getConnection();
    try {
        // Realiza uma consulta SQL para buscar um usuário com o ID fornecido.
        const [rows] = await connection.query('SELECT * FROM users WHERE id = ?', [id]);
        if (rows.length === 0) {
            // Se nenhum usuário for encontrado com o ID especificado, retorna um erro 404.
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        // Retorna os detalhes do usuário encontrado.
        return res.json(rows[0]); 
        // O código abaixo nunca será executado, pois a função já retornou na linha anterior.
        // return res.status(500).json({ message: 'Erro ao buscar usuário', error: error.message });
    } finally {
        // Libera a conexão com o pool de conexões após o uso.
        connection.release();
    }
});

/**
 * @description Rota para buscar todos os usuários.
 * @param {} - Nenhum parâmetro é necessário.
 * @returns {Array} - Uma lista de todos os usuários.
 */
router.get('/', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        // Realiza uma consulta SQL para buscar todos os usuários na tabela.
        const [rows] = await connection.query('SELECT * FROM users');
        // Retorna a lista de usuários encontrados.
        return res.json(rows);
    } catch (error) {
        // Se ocorrer um erro durante a consulta, retorna um erro 500.
        return res.status(500).json({ message: 'Erro ao buscar usuários', error: error.message });
    } finally {
        // Libera a conexão com o pool de conexões após o uso.
        connection.release();
    }
});

/**
 * @description Rota para criar um novo usuário.
 * @param {string} req.body.first_name - O primeiro nome do usuário.
 * @param {string} req.body.last_name - O sobrenome do usuário.
 * @param {string} req.body.email - O email do usuário.
 * @param {string} req.body.password - A senha do usuário.
 * @param {...} req.body - Outros campos opcionais para o usuário.
 * @returns {Object} - Mensagem de sucesso ou erro.
 */
router.post('/', async (req, res) => {
    // Extrai os dados do corpo da requisição.
    const { first_name, last_name, email, password, date_of_birth, phone, gender, profile_picture, bio, status, city, street, postal_code, state, country, nationality, occupation, company, website, social_media, interests, skills, education, languages } = req.body;
    // Verifica se os campos obrigatórios foram fornecidos.
    if (!first_name || !last_name || !email || !password) {
        // Se algum campo obrigatório estiver ausente, retorna um erro 400.
        return res.status(400).json({ message: 'Nome, sobrenome, email e senha são obrigatórios' });
    }
    const connection = await pool.getConnection();
    try {
        // Insere os dados do novo usuário na tabela do banco de dados.
        await connection.query('INSERT INTO users (first_name, last_name, email, password, date_of_birth, phone, gender, profile_picture, bio, status, city, street, postal_code, state, country, nationality, occupation, company, website, social_media, interests, skills, education, languages) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [first_name, last_name, email, password, date_of_birth, phone, gender, profile_picture, bio, status, city, street, postal_code, state, country, nationality, occupation, company, website, social_media, interests, skills, education, languages]);
        // Retorna uma mensagem de sucesso após a inserção do usuário.
        return res.status(201).json({ message: 'Usuário criado com sucesso' });
    } catch (error) {
        // Se ocorrer um erro durante a inserção, retorna um erro 500.
        return res.status(500).json({ message: 'Erro ao criar usuário', error: error.message });
    } finally {
        // Libera a conexão com o pool de conexões após o uso.
        connection.release();
    }
});

/**
 * @description Rota para atualizar um usuário existente pelo ID.
 * @param {string} req.params.id - O ID do usuário a ser atualizado.
 * @param {string} req.body.first_name - O primeiro nome do usuário.
 * @param {string} req.body.last_name - O sobrenome do usuário.
 * @param {string} req.body.email - O email do usuário.
 * @param {string} req.body.password - A senha do usuário.
 * @param {...} req.body - Outros campos opcionais para o usuário.
 * @returns {Object} - Mensagem de sucesso ou erro.
 */
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    // Extrai os dados do corpo da requisição.
    const { first_name, last_name, email, password, date_of_birth, phone, gender, profile_picture, bio, status, city, street, postal_code, state, country, nationality, occupation, company, website, social_media, interests, skills, education, languages } = req.body;
    // Verifica se os campos obrigatórios foram fornecidos.
    if (!first_name || !last_name || !email || !password) {
        // Se algum campo obrigatório estiver ausente, retorna um erro 400.
        return res.status(400).json({ message: 'Nome, sobrenome, email e senha são obrigatórios' });
    }
    const connection = await pool.getConnection();
    try {
        // Atualiza os dados do usuário na tabela do banco de dados.
        await connection.query('UPDATE users SET first_name = ?, last_name = ?, email = ?, password = ?, date_of_birth = ?, phone = ?, gender = ?, profile_picture = ?, bio = ?, status = ?, city = ?, street = ?, postal_code = ?, state = ?, country = ?, nationality = ?, occupation = ?, company = ?, website = ?, social_media = ?, interests = ?, skills = ?, education = ?, languages = ? WHERE id = ?',
            [first_name, last_name, email, password, date_of_birth, phone, gender, profile_picture, bio, status, city, street, postal_code, state, country, nationality, occupation, company, website, social_media, interests, skills, education, languages, id]);
        // Retorna uma mensagem de sucesso após a atualização do usuário.
        return res.json({ message: 'Usuário atualizado com sucesso' });
    } catch (error) {
        // Se ocorrer um erro durante a atualização, retorna um erro 500.
        return res.status(500).json({ message: 'Erro ao atualizar usuário', error: error.message });
    } finally {
        // Libera a conexão com o pool de conexões após o uso.
        connection.release();
    }
});

/**
 * @description Rota para deletar um usuário pelo ID.
 * @param {string} req.params.id - O ID do usuário a ser deletado.
 * @returns {Object} - Mensagem de sucesso ou erro.
 */
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const connection = await pool.getConnection();
    try {
        // Deleta o usuário com o ID especificado da tabela do banco de dados.
        await connection.query('DELETE FROM users WHERE id = ?', [id]);
        // Retorna uma mensagem de sucesso após a exclusão do usuário.
        return res.json({ message: 'Usuário deletado com sucesso' });
    } catch (error) {
        // Se ocorrer um erro durante a exclusão, retorna um erro 500.
        return res.status(500).json({ message: 'Erro ao deletar usuário', error: error.message });
    } finally {
        // Libera a conexão com o pool de conexões após o uso.
        connection.release();
    }
});

module.exports = router;