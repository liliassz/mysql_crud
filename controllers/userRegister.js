const { hash, genSalt } = require('bcrypt');
const pool = require('../config/dbConfig');
const express = require('express');
const router = express.Router();
require('dotenv').config();

// Rota de registro
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username) {
        return res.status(422).json({ msg: "O nome de usuário é obrigatório!" });
    }

    if (!email) {
        return res.status(422).json({ msg: "O email é obrigatório!" });
    }

    if (!password) {
        return res.status(422).json({ msg: "A senha é obrigatória!" });
    }

    try {
        connection = await pool.getConnection();
        const salt = await genSalt(12);
        const passwordHash = await hash(password, salt);

        await connection.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, passwordHash]);

        return res.status(201).json({ message: 'Usuário criado com sucesso' });
    } catch (error) {
        if (error.sqlMessage) {
            if (error.sqlMessage.includes('Duplicate entry') && error.sqlMessage.includes('users.username')) {
                return res.status(400).json({ message: 'Nome de usuário já cadastrado.' });
            }
            if (error.sqlMessage.includes('Duplicate entry') && error.sqlMessage.includes('users.email')) {
                return res.status(400).json({ message: 'Email já cadastrado.' });
            }
        }
        return res.status(500).json({ message: 'Erro ao criar usuário', error: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

module.exports = router;
