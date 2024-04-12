const express = require('express');
const pool = require('../config/config');
const router = express.Router();

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query('SELECT * FROM users WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        return res.json(rows[0]); 
        return res.status(500).json({ message: 'Erro ao buscar usuário', error: error.message });
    } finally {
        connection.release();
    }
});


router.get('/', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query('SELECT * FROM users');
        return res.json(rows);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao buscar usuários', error: error.message });
    } finally {
        connection.release();
    }
});

router.post('/', async (req, res) => {
    const { first_name, last_name, email, password, date_of_birth, phone, gender, profile_picture, bio, status, city, street, postal_code, state, country, nationality, occupation, company, website, social_media, interests, skills, education, languages } = req.body;
    if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({ message: 'Nome, sobrenome, email e senha são obrigatórios' });
    }
    const connection = await pool.getConnection();
    try {
        await connection.query('INSERT INTO users (first_name, last_name, email, password, date_of_birth, phone, gender, profile_picture, bio, status, city, street, postal_code, state, country, nationality, occupation, company, website, social_media, interests, skills, education, languages) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [first_name, last_name, email, password, date_of_birth, phone, gender, profile_picture, bio, status, city, street, postal_code, state, country, nationality, occupation, company, website, social_media, interests, skills, education, languages]);
        return res.status(201).json({ message: 'Usuário criado com sucesso' });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao criar usuário', error: error.message });
    } finally {
        connection.release();
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, email, password, date_of_birth, phone, gender, profile_picture, bio, status, city, street, postal_code, state, country, nationality, occupation, company, website, social_media, interests, skills, education, languages } = req.body;
    if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({ message: 'Nome, sobrenome, email e senha são obrigatórios' });
    }
    const connection = await pool.getConnection();
    try {
        await connection.query('UPDATE users SET first_name = ?, last_name = ?, email = ?, password = ?, date_of_birth = ?, phone = ?, gender = ?, profile_picture = ?, bio = ?, status = ?, city = ?, street = ?, postal_code = ?, state = ?, country = ?, nationality = ?, occupation = ?, company = ?, website = ?, social_media = ?, interests = ?, skills = ?, education = ?, languages = ? WHERE id = ?',
            [first_name, last_name, email, password, date_of_birth, phone, gender, profile_picture, bio, status, city, street, postal_code, state, country, nationality, occupation, company, website, social_media, interests, skills, education, languages, id]);
        return res.json({ message: 'Usuário atualizado com sucesso' });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao atualizar usuário', error: error.message });
    } finally {
        connection.release();
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const connection = await pool.getConnection();
    try {
        await connection.query('DELETE FROM users WHERE id = ?', [id]);
        return res.json({ message: 'Usuário deletado com sucesso' });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao deletar usuário', error: error.message });
    } finally {
        connection.release();
    }
});

module.exports = router