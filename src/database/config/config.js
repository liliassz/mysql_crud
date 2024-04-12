// Importa o módulo mysql2/promise para criar a conexão com o banco de dados MySQL
const mysql = require('mysql2/promise');

// Importa o módulo dotenv para carregar variáveis de ambiente a partir do arquivo .env
require('dotenv').config();

/**
 * @description Cria uma conexão pool com o banco de dados MySQL.
 * @returns {Object} - Retorna um pool de conexão com o banco de dados.
 */

// Criação de um pool de conexões com o MySQL
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST, // Endereço do host do banco de dados MySQL
  user: process.env.MYSQL_USER,  // Nome do usuário do banco de dados MySQL
  password: process.env.MYSQL_PASSWORD,  // Senha do usuário do banco de dados MySQL
  database: process.env.MYSQL_DB,  // Nome do banco de dados MySQL
});

// Exporta o pool de conexões para ser utilizado em outros módulos
module.exports = pool;
