const pool = require('../config/dbConfig');
const express = require('express');
const router = express.Router();
const checkToken = require('../middlewares/checkToken');

router.get('/user/:id', checkToken, async (req, res) => {
    const { id } = req.params;
    const { userId } = req; // ID do usuário extraído do token

    if (id != userId) {
        return res.status(403).json({ message: 'Acesso negado: você não pode acessar este recurso' });
    }

    try {
        connection = await pool.getConnection();
        const [users] = await connection.query('SELECT * FROM users WHERE id = ?', [id]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        delete users[0].password; // Remove a senha do usuário
        return res.json(users[0]);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao buscar usuário', error: error.message });
    } finally {
        connection.release();
    }
});

module.exports = router;
