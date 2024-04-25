const express = require('express'); // Importa o módulo 'express', que é um framework web para Node.js.
const pool = require('../config/config'); // Importa o pool de conexão com o banco de dados configurado.
const router = express.Router(); // Cria uma instância do roteador do Express.

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const connection = await pool.getConnection();
  try {
    const [users] = await connection.query('SELECT * FROM users WHERE id = ?', [id]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const completeUsers = [];

    for (const user of users) {
      const userId = user.id;

      const [address] = await connection.query('SELECT * FROM addresses WHERE user_id = ?', [userId]);

      const [socialInfo] = await connection.query('SELECT * FROM social_info WHERE user_id = ?', [userId]);

      const completeUser = {
        ...user, 
        address: address[0] || {},
        socialInfo: socialInfo[0] || {}, 
      };

      completeUsers.push(completeUser);
    }

    return res.json(completeUsers[0]);
  } finally {
    connection.release();
  }
});

router.get('/', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const [users] = await connection.query('SELECT * FROM users');

    const completeUsers = [];

    for (const user of users) {
      const userId = user.id;

      const [address] = await connection.query('SELECT * FROM addresses WHERE user_id = ?', [userId]);

      const [socialInfo] = await connection.query('SELECT * FROM social_info WHERE user_id = ?', [userId]);

      const completeUser = {
        ...user, 
        address: address[0] || {},
        socialInfo: socialInfo[0] || {}, 
      };

      completeUsers.push(completeUser);
    }

    return res.json(completeUsers);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar usuários', error: error.message });
  } finally {
    connection.release();
  }
});

router.post('/', async (req, res) => {
  const { username, first_name, last_name, email, password, age, date_of_birth, phone, gender, profile_picture, bio, city, street, postal_code, state, country, occupation, website, skill, company, language } = req.body;
  const connection = await pool.getConnection();

  if (![username, first_name, last_name, email, password].every(Boolean)) {
    return res.status(400).json({ message: 'Nome de usuário, nome, sobrenome, email e senha são obrigatórios' });
  }else if (username.length > 10) {
    return res.status(400).json({ message: 'Seu nome de usuário ultrapassou o limite de 10 caracteres.' });
  } else if (first_name.length > 10) {
    return res.status(400).json({ message: 'Seu nome ultrapassou o limite de 10 caracteres.' });
  } else if (last_name.length > 10) {
    return res.status(400).json({ message: 'Seu sobrenome ultrapassou o limite de 10 caracteres.' });
  }

  try {
    await connection.query('INSERT INTO users (username, first_name, last_name, email, password, age, phone, gender, date_of_birth) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [username, first_name, last_name, email, password, age, phone, gender, date_of_birth]);
    const [result] = await connection.query('SELECT LAST_INSERT_ID() AS id');
    const userId = result[0].id;

    const addressData = { user_id: userId, city, street, postal_code, state, country };
    const socialInfoData = { user_id: userId, profile_picture, bio, website, occupation, company, skill, language };

    await Promise.all([
      connection.query('INSERT INTO addresses SET ?', addressData),
      connection.query('INSERT INTO social_info SET ?', socialInfoData)
    ]);

    return res.status(201).json({ message: 'Usuário criado com sucesso' });
  } catch (error) {
    if (error.sqlMessage.includes('Duplicate entry') && error.sqlMessage.includes('users.username')) {
      return res.status(400).json({ message: 'Nome de usuário já cadastrado.' });
    }
    if (error.sqlMessage.includes('Duplicate entry') && error.sqlMessage.includes('users.email')) {
      return res.status(400).json({ message: 'Email já cadastrado.' });
    }

    return res.status(500).json({ message: 'Erro ao criar usuário', error: error.message });
  } finally {
    connection.release();
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;

  const { username, first_name, last_name, email, password, age, date_of_birth, phone, gender, profile_picture, bio, city, street, postal_code, state, country, occupation, website, skill, company, language } = req.body;

  if (![username, first_name, last_name, email, password].every(Boolean)) {
    return res.status(400).json({ message: 'Nome de usuário, nome, sobrenome, email e senha são obrigatórios' });
  }else if (username.length > 10) {
    return res.status(400).json({ message: 'Seu nome de usuário ultrapassou o limite de 10 caracteres.' });
  } else if (first_name.length > 10) {
    return res.status(400).json({ message: 'Seu nome ultrapassou o limite de 10 caracteres.' });
  } else if (last_name.length > 10) {
    return res.status(400).json({ message: 'Seu sobrenome ultrapassou o limite de 10 caracteres.' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.query('UPDATE users SET username = ?, first_name = ?, last_name = ?, email = ?, password = ?, age = ?, date_of_birth = ?, phone = ?, gender = ? WHERE id = ?', [username, first_name, last_name, email, password, age, date_of_birth, phone, gender, id]);

    await connection.query('UPDATE addresses SET street = ?, city = ?, state = ?, postal_code = ?, country = ? WHERE user_id = ?', [street, city, state, postal_code, country, id]);

    await connection.query('UPDATE social_info SET profile_picture = ?, bio = ?, website = ?, occupation = ?, company = ?, skill = ?, language = ? WHERE user_id = ?', [profile_picture, bio, website, occupation, company, skill, language, id]);

    return res.json({ message: 'Usuário atualizado com sucesso' });
    
  } catch (error) {
    console.error(error)
    if (error.sqlMessage.includes('Duplicate entry') && error.sqlMessage.includes('users.username')) {
      return res.status(400).json({ message: 'Nome de usuário já cadastrado.' });
    }else if (error.sqlMessage.includes('Duplicate entry') && error.sqlMessage.includes('users.email')) {
      return res.status(400).json({ message: 'Email já cadastrado.' });
    }

    return res.status(500).json({ message: 'Erro ao atualizar usuário', error: error.message });
  } finally {
    connection.release();
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const connection = await pool.getConnection();
  try {
    // Exclui o usuário e os registros associados na tabela de endereços de forma automática
    await connection.query('DELETE FROM users WHERE id = ?', [id]);
    return res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    return res.status(500).json({ message: 'Erro ao deletar usuário', error: error.message });
  } finally {
    connection.release();
  }
});

module.exports = router