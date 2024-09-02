const pool = require('../config/dbConfig');
const { compare } = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
require('dotenv').config();

// Rota de login
router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        return res.status(422).json({ msg: "O email é obrigatório!" });
    }

    if (!password) {
        return res.status(422).json({ msg: "A senha é obrigatória!" });
    }

    try {
        connection = await pool.getConnection();
        const [user] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (user.length === 0) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const userRecord = user[0];
        const isPasswordValid = await compare(password, userRecord.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const secret = process.env.JWT_SECRET

        const token = jwt.sign(
            {
                id: userRecord.id,
                username: userRecord.username,
                email: userRecord.email
            },
            secret, 
            // { expiresIn: '1h' }
        );

        return res.json({ message: 'Login bem-sucedido', token });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao efetuar login', error: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

module.exports = router;
