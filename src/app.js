// Importa o módulo express para criação de um servidor web.
const express = require('express');

//cors 
const cors = require('cors')

// Ou permitir apenas uma origem específica
// app.use(cors({ origin: 'http://localhost:5500' }));


// Importa a função de conexão com o banco de dados.
const connect = require('./database/connect');

// Importa as rotas relacionadas aos usuários.
const userRoutes = require('./controllers/usersController');

// Carrega as variáveis de ambiente do arquivo .env.
require('dotenv').config();

// Cria uma instância do servidor Express.
const server = express();

// Permitir uma origem específica e métodos HTTP específicos
// server.use(cors({ 
//     origin: 'http://localhost:5500',
//     methods: ['GET', 'POST', 'PUT', 'DELETE'] 
// })); 

// Permitir todas as origens (não recomendado para produção)
server.use(cors()); 

// Middleware para analisar o corpo das requisições como JSON.
server.use(express.json());

// Define as rotas relacionadas aos usuários.
server.use('/users', userRoutes);

server.use(express.static('public'));

// Estabelece a conexão com o banco de dados.
connect();

// Inicia o servidor Express, ouvindo na porta definida na variável de ambiente PORT.
server.listen(process.env.PORT, () => {
    console.log('Servidor rodando na porta ' + process.env.PORT);
});
