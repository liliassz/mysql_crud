const express = require('express'); // Importa o módulo 'express', que é um framework web para Node.js.
const pool = require('../config/dbConfig'); // Importa o pool de conexão com o banco de dados configurado.
const hashPassword = require('../middlewares/hashPassword');

const router = express.Router(); // Cria uma instância do roteador do Express.

router.post('/', hashPassword, async (req, res) => {
    const { username, email, password_hash, hashedPassword, first_name, last_name } = req.body;
    const connection = await pool.getConnection();


    // Validação dos dados 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!first_name) { return res.status(400).json({ message: 'O nome é obrigatório.' }); }
    if (!last_name) { return res.status(400).json({ message: 'O sobrenome é obrigatório.' }); }
    if (!username) { return res.status(400).json({ message: 'O nome de usuário  é obrigatório.' }); }
    if (!email) { return res.status(400).json({ message: 'O email é obrigatório.' }); }
    if (!emailRegex.test(email)) { return res.status(400).json({ message: 'Formato de email inválido.' }); }
    if (!hashedPassword) { return res.status(400).json({ message: 'A senha é obrigatória.' }); }
    if (password_hash.length < 8) { return res.status(400).json({ message: 'A senha precisa ter no minimo 8 caracteres.' }); }


    try {
        // Iniciando uma transição para garantir que todos os dados sejam enviados com segurança e caso de erro da um 'rollback'
        await connection.beginTransaction();

        const [userResult] = await connection.query('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)', [username, email, password_hash]);
        const userId = userResult.insertId; // Pegar o ID do usuário recém-criado
        await connection.query('INSERT INTO personal_info (user_id, first_name, last_name) VALUES (?, ?, ?)', [userId, first_name, last_name]);

        // Confirmar transação caso todos os dados forem enviados com sucesso
        await connection.commit();

        return res.status(201).json({ message: 'Usuário criado com sucesso' });
    } catch (error) {
        // Reverte a transação em caso de erro
        await connection.rollback();

        // validação para identificar o erro
        if (error.sqlMessage.includes('Duplicate entry') && error.sqlMessage.includes('users.username')) { return res.status(400).json({ message: 'Nome de usuário já cadastrado.' }); }
        if (error.sqlMessage.includes('Duplicate entry') && error.sqlMessage.includes('users.email')) { return res.status(400).json({ message: 'Email já cadastrado.' }); }

        // caso o erro não esteja na validação, ele retorna o erro encontrado
        return res.status(500).json({ message: 'Erro ao criar usuário', error: error.message });
    } finally {
        connection.release();
    }
});

/**
 * Rota para efetuar o login de um usuário.
 * 
 * Esta rota:
 * 1. Recebe as credenciais de login (username ou email e senha) do usuário.
 * 2. Valida a presença das credenciais e assegura que a senha é fornecida.
 * 3. Busca o usuário no banco de dados com base no email ou username.
 * 4. Verifica se o usuário existe e valida a senha fornecida.
 * 5. Gera um token JWT se as credenciais forem válidas, contendo informações do usuário.
 * 6. Retorna uma resposta com o token em caso de sucesso ou uma mensagem de erro apropriada.
 * 
 * Validações:
 * - O email ou username deve ser fornecido.
 * - A senha é obrigatória.
 * 
 * Observações:
 * - Evita expor informações sensíveis ao retornar mensagens genéricas para falhas de autenticação.
 * - O token gerado tem um tempo de expiração configurável (1 hora neste exemplo).
 * 
 * @param {object} req - Objeto de requisição Express contendo as credenciais do usuário.
 * @param {object} res - Objeto de resposta Express.
 * @returns {void}
 */

router.post('/signin', async (req, res) => {
    const { username, email, password_hash } = req.body;
  
    // Validação simples
    if (!email && !username) {
      return res.status(422).json({ msg: "O email ou username é obrigatório" });
    }
    if (!password_hash) {
      return res.status(422).json({ msg: "A senha é obrigatória!" });
    }
  
    let connection;
  
    try {
      connection = await pool.getConnection();
  
      // Buscar usuário por email ou username
      const query = 'SELECT * FROM users WHERE email = ? OR username = ?';
      const [user] = await connection.query(query, [email, username]);
  
      if (user.length === 0) {
        return res.status(401).json({ message: 'Credenciais inválidas.' });
      }
  
      const userRecord = user[0];
      const isPasswordValid = await compare(password_hash, userRecord.password_hash);
  
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Credenciais inválidas.' });
      }
  
      const secret = process.env.JWT_SECRET;
  
      const token = jwt.sign(
        {
          id: userRecord.id,
          username: userRecord.username,
          email: userRecord.email,
        },
        secret,
        { expiresIn: '1h' } // Configuração do tempo de expiração do token
      );
  
      return res.json({ message: 'Login bem-sucedido', token });
    } catch (error) {
      console.error('Erro ao efetuar login:', error); // Log do erro
      return res.status(500).json({ message: 'Erro ao efetuar login' });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  });
  

module.exports = router
