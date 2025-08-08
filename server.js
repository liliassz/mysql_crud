
const express = require('express'); // Importa o módulo express para criação de um servidor web.
const userRoutes = require('./controllers/usersController'); // Importa as rotas relacionadas aos usuários.
const userRegister  = require('./controllers/authController'); // Importa as rotas relacionadas aos usuários.
const protectedRoutes  = require('./controllers/protectedRoutes'); // Importa as rotas relacionadas aos usuários.
const userLogin = require('./controllers/authController'); // Importa as rotas relacionadas aos usuários.
const connect = require('./database/connect'); // Importa a função de conexão com o banco de dados.
const cors = require('cors'); //cors 
require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env.

// Cria uma instância do servidor Express.
const server = express();

/**
* Permitir uma origem específica e métodos HTTP específicos
*    server.use(cors({ 
*    origin: 'http://localhost:5500',
*    methods: ['GET', 'POST', 'PUT', 'DELETE'] 
*
* Ou permitir apenas uma origem específica
*    server.use(cors({ origin: 'http://localhost:5500' }));
*  
*/

server.use(cors()); // Permitir todas as origens (não recomendado para produção)

server.use(express.json()); // Middleware para analisar o corpo das requisições como JSON.

server.use('/users', userRoutes, protectedRoutes); // rotas relacionadas aos usuários.

server.use('/auth', userRegister); // Rota de registro

server.use('/auth', userLogin); // Rota de login

server.use(express.static('public')); // Estabelece a conexão com o banco de dados.

server.listen(process.env.PORT, () => {
    console.log('Servidor rodando na porta ' + process.env.PORT);
}); // Inicia o servidor Express, ouvindo na porta definida na variável de ambiente PORT.

connect(); // Inicia o banco de dados


