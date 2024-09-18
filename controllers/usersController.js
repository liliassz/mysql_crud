const express = require('express'); // Importa o módulo 'express', que é um framework web para Node.js.
const pool = require('../config/dbConfig'); // Importa o pool de conexão com o banco de dados configurado.
const validateUser = require('../middlewares/verificacao');
const hashPassword = require('../middlewares/hashPassword');

const router = express.Router(); // Cria uma instância do roteador do Express.
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const connection = await pool.getConnection();
  try {
    // Consulta para obter informações do usuário
    const [user] = await connection.query('SELECT * FROM users WHERE id = ?', [id]);

    // Verificação para ver se o usuario existe
    if (user.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Consulta para obter informações pessoais do usuário
    const [personalInfo] = await connection.query('SELECT * FROM personal_info WHERE user_id = ?', [id]);

    // Consulta para obter endereços do usuário
    const [addresses] = await connection.query('SELECT * FROM address WHERE user_id = ?', [id]);

    // Consulta para obter informações de contato do usuário
    const [contactInfo] = await connection.query('SELECT * FROM contact_info WHERE user_id = ?', [id]);

    // Consulta para obter preferências do usuário
    const [preferences] = await connection.query('SELECT * FROM preferences WHERE user_id = ?', [id]);

    // Consulta para obter contas de redes sociais do usuário
    const [socialAccounts] = await connection.query('SELECT * FROM social_accounts WHERE user_id = ?', [id]);

    // Consulta para obter métodos de pagamento do usuário
    const [paymentMethods] = await connection.query('SELECT * FROM payment_methods WHERE user_id = ?', [id]);

    // Consulta para obter notificações do usuário
    const [notifications] = await connection.query('SELECT * FROM notifications WHERE user_id = ?', [id]);

    // Consulta para obter amigos do usuário
    const [friends] = await connection.query('SELECT * FROM friends WHERE user_id = ? OR friend_id = ?', [id, id]);

    // Consulta para obter conquistas do usuário
    const [achievements] = await connection.query('SELECT * FROM achievements WHERE user_id = ?', [id]);

    // Consulta para obter histórico de login do usuário
    const [loginHistory] = await connection.query('SELECT * FROM login_history WHERE user_id = ?', [id]);

    // Consulta para obter tickets de suporte do usuário
    const [supportTickets] = await connection.query('SELECT * FROM support_tickets WHERE user_id = ?', [id]);

    // Adiciona todas as informações ao objeto do usuário
    user[0].personal_info = personalInfo[0] || null;
    user[0].addresses = addresses;
    user[0].contact_info = contactInfo[0] || null;
    user[0].preferences = preferences[0] || null;
    user[0].social_accounts = socialAccounts;
    user[0].payment_methods = paymentMethods;
    user[0].notifications = notifications;
    user[0].friends = friends;
    user[0].achievements = achievements;
    user[0].login_history = loginHistory;
    user[0].support_tickets = supportTickets;

    return res.json(user[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar usuário e dados relacionados', error: error.message });
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

router.post('/', hashPassword, validateUser, async (req, res) => {
  const { username, first_name, last_name, email, age, date_of_birth, phone, gender, profile_picture, bio, city, street, postal_code, state, country, occupation, website, skill, company, language } = req.body;
  const connection = await pool.getConnection();
  const hashedPassword = req.body.hashedPassword;

  try {
    await connection.query('INSERT INTO users (username, first_name, last_name, email, password, age, phone, gender, date_of_birth) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [username, first_name, last_name, email, hashedPassword, age, phone, gender, date_of_birth]);
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

router.put('/:id', hashPassword, async (req, res) => {
  const { username, first_name, last_name, email, age, date_of_birth, phone, gender, profile_picture, bio, city, street, postal_code, state, country, occupation, website, skill, company, language } = req.body;
  const connection = await pool.getConnection();
  const hashedPassword = req.body.hashedPassword;
  const { id } = req.params;

  try {
    await connection.query('UPDATE users SET username = ?, first_name = ?, last_name = ?, email = ?, password = ?, age = ?, date_of_birth = ?, phone = ?, gender = ? WHERE id = ?', [username, first_name, last_name, email, hashedPassword, age, date_of_birth, phone, gender, id]);
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
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

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