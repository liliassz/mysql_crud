const express = require('express');
const connect = require('./database/connect');
const userRoutes = require('./database/controllers/usersController');
require('dotenv').config();

const server = express(); 

server.use(express.json())
// Define o prefixo '/users' para todas as rotas relacionadas aos usuários
server.use('/users', userRoutes);
// Chama a função de conexão
connect();

server.listen(process.env.PORT, () => {
    console.log('Servidor rodando na porta 3000');
});
