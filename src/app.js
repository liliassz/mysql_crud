const express = require('express');
const connect = require('./database/connect');
const userRoutes = require('./database/controllers/usersController');
require('dotenv').config();

const sever = express(); 

// Define o prefixo '/users' para todas as rotas relacionadas aos usuários
sever.use('/users', userRoutes);

// Chama a função de conexão
connect();

sever.listen(process.env.PORT, () => {
    console.log('Servidor rodando na porta 3000');
});
