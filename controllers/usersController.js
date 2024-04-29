const express = require('express'); // Importa o módulo 'express', que é um framework web para Node.js.
const pool = require('../config/dbConfig'); // Importa o pool de conexão com o banco de dados configurado.
const router = express.Router(); // Cria uma instância do roteador do Express.
const { verificateUser } = require('../utils/funcoes/verificacao')

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const connection = await pool.getConnection();
  try {
    const [users] = await connection.query('SELECT * FROM user_full_details WHERE id = ?', [id]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    return res.json(users[0]);
  } catch {
    return res.status(500).json({ message: 'Erro ao buscar usuários', error: error.message });
  } finally {
    connection.release();
  }
});

router.get('/', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const [users] = await connection.query('SELECT * FROM user_full_details');
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar usuários', error: error.message });
  } finally {
    connection.release();
  }
});

router.post('/', async (req, res) => {
  const { username, first_name, last_name, email, password, age, date_of_birth, phone, gender, profile_picture, bio, city, street, postal_code, state, country, occupation, website, skill, company, language } = req.body;
  const connection = await pool.getConnection();

  const verification = verificateUser(req.body);
  if (!verification.isValid) {
    return res.status(400).json({ message: verification.message });
  }

  try {
    await connection.query('INSERT INTO users (username, first_name, last_name, email, password, age, phone, gender, date_of_birth) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [username, first_name, last_name, email, password, age, phone, gender, date_of_birth]);
    const [result] = await connection.query('SELECT LAST_INSERT_ID() AS id');
    const userId = result[0].id;

    const addressData = { user_id: userId, city, street, postal_code, state, country };
    const socialInfoData = { user_id: userId, profile_picture, bio, website, occupation, company, skill, language };

    await Promise.all([
      connection.query('INSERT INTO address SET ?', addressData),
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

  const verification = verificateUser(req.body);
  if (!verification.isValid) {
    return res.status(400).json({ message: verification.message });
  }

  const connection = await pool.getConnection();
  try {
    await connection.query('UPDATE users SET username = ?, first_name = ?, last_name = ?, email = ?, password = ?, age = ?, date_of_birth = ?, phone = ?, gender = ? WHERE id = ?', [username, first_name, last_name, email, password, age, date_of_birth, phone, gender, id]);

    await connection.query('UPDATE address SET street = ?, city = ?, state = ?, postal_code = ?, country = ? WHERE user_id = ?', [street, city, state, postal_code, country, id]);

    await connection.query('UPDATE social_info SET profile_picture = ?, bio = ?, website = ?, occupation = ?, company = ?, skill = ?, language = ? WHERE user_id = ?', [profile_picture, bio, website, occupation, company, skill, language, id]);

    return res.json({ message: 'Usuário atualizado com sucesso' });

  } catch (error) {
    console.error(error)
    if (error.sqlMessage.includes('Duplicate entry') && error.sqlMessage.includes('users.username')) {
      return res.status(400).json({ message: 'Nome de usuário já cadastrado.' });
    } else if (error.sqlMessage.includes('Duplicate entry') && error.sqlMessage.includes('users.email')) {
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
    const sql = 'SELECT * FROM users WHERE id = ?';

    const [results] = await connection.query(sql, [id]);
    if (results.length > 0) {
      await connection.query('DELETE FROM users WHERE id = ?', [id]);
      return res.json({ message: 'Usuário deletado com sucesso' });
    } else {
      console.log('O usuário não existe.');
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

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