

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
 * @description Rota para buscar todos os usuários do sistema.
 * @param {} - Nenhum parâmetro é necessário.
 * @returns {Array} - Uma lista contendo todos os usuários e seus dados completos, incluindo informações de endereço e mídia social.
**/

router.get('/', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    // Consulta principal para buscar usuários da tabela 'users'
    const [users] = await connection.query('SELECT * FROM users');

    // Lista para armazenar os dados completos dos usuários
    const completeUsers = [];

    // Loop para processar cada usuário
    for (const user of users) {
      const userId = user.id;

      // Consulta para buscar endereço do usuário
      const [address] = await connection.query('SELECT * FROM addresses WHERE user_id = ?', [userId]);

      // Consulta para buscar informações sociais do usuário
      const [socialInfo] = await connection.query('SELECT * FROM social_info WHERE user_id = ?', [userId]);

      // Combina dados de todas as tabelas em um único objeto
      const completeUser = {
        ...user, // Inclui todos os campos da tabela 'users'
        address: address[0] || {}, // Inclui dados de endereço (ou objeto vazio se não encontrado)
        socialInfo: socialInfo[0] || {}, // Inclui informações de mídia social (ou objeto vazio se não encontrado)
      };

      // Adiciona o usuário completo à lista
      completeUsers.push(completeUser);
    }

    // Retorna a lista de usuários com todos os dados
    return res.json(completeUsers);
  } catch (error) {
    // Manipulação de erros
    console.error('Erro ao buscar usuários:', error);
    return res.status(500).json({ message: 'Erro ao buscar usuários', error: error.message });
  } finally {
    // Libera a conexão com o pool de conexões
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
  const { username, first_name, last_name, email, password, date_of_birth, phone, gender, profile_picture, bio, status, city, street, postal_code, state, country, occupation, website, skill, company, language } = req.body;
  const connection = await pool.getConnection();

  if (![username, first_name, last_name, email, password].every(Boolean)) {
    return res.status(400).json({ message: 'Nome de usuário, nome, sobrenome, email e senha são obrigatórios' });
  }

  try {
    await connection.query('INSERT INTO users (username, first_name, last_name, email, password, date_of_birth, phone, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [username, first_name, last_name, email, password, date_of_birth, phone, gender]);
    const [result] = await connection.query('SELECT LAST_INSERT_ID() AS id');
    const userId = result[0].id;

    const addressData = { user_id: userId, city, street, postal_code, state, country };
    const socialInfoData = { user_id: userId, profile_picture, bio, status, website, occupation, company, skill, language };

    await Promise.all([
      connection.query('INSERT INTO addresses SET ?', addressData),
      connection.query('INSERT INTO social_info SET ?', socialInfoData)
    ]);

    return res.status(201).json({ message: 'Usuário criado com sucesso' });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    if (error.code === 'ER_DUP_FIELD') {
      return res.status(400).json({ message: 'Nome de usuário já existe. Escolha outro nome de usuário.' });
    }
    return res.status(500).json({ message: 'Erro ao criar usuário', error: error.message });
  } finally {
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
  const { first_name, last_name, email, password, date_of_birth, phone, gender, profile_picture, bio, status, city, street, postal_code, state, country, nationality, occupation, company, website, social_media, interests, skill, education, language } = req.body;
  // Verifica se os campos obrigatórios foram fornecidos.
  if (!first_name || !last_name || !email || !password) {
    // Se algum campo obrigatório estiver ausente, retorna um erro 400.
    return res.status(400).json({ message: 'Nome, sobrenome, email e senha são obrigatórios' });
  }
  const connection = await pool.getConnection();
  try {
    // Atualiza os dados do usuário na tabela do banco de dados.
    await connection.query('UPDATE users SET first_name = ?, last_name = ?, email = ?, password = ?, date_of_birth = ?, phone = ?, gender = ?, profile_picture = ?, bio = ?, status = ?, city = ?, street = ?, postal_code = ?, state = ?, country = ?, nationality = ?, occupation = ?, company = ?, website = ?, social_media = ?, interests = ?, skill = ?, education = ?, language = ? WHERE id = ?',
      [first_name, last_name, email, password, date_of_birth, phone, gender, profile_picture, bio, status, city, street, postal_code, state, country, nationality, occupation, company, website, social_media, interests, skill, education, language, id]);
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
    // Consulta SQL para verificar se o usuário existe
    const sql = 'SELECT * FROM users WHERE id = ?';

    // Executa a consulta SQL
    const [results] = await connection.query(sql, [id]);
    // console.log(results) verificar se o usuario esta chegando

    // Verifica se algum resultado foi retornado
    if (results.length > 0) {
      // Deleta o usuário com o ID especificado da tabela do banco de dados.
      await connection.query('DELETE FROM users WHERE id = ?', [id]);
      // Retorna uma mensagem de sucesso após a exclusão do usuário.
      return res.json({ message: 'Usuário deletado com sucesso' });
    } else {
      console.log('O usuário não existe.');
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

  } catch (error) {
    // Se ocorrer um erro, retorna um erro 500.
    console.error('Erro ao deletar usuário:', error);
    return res.status(500).json({ message: 'Erro ao deletar usuário', error: error.message });
  } finally {
    // Libera a conexão com o pool de conexões após o uso.
    connection.release();
  }
});



module.exports = router