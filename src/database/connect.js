// Importa o módulo responsável por configurar a conexão com o banco de dados
const pool = require('../config/config');

// Importa o módulo responsável por criar a tabela de usuários
const createTable = require('./usersCreateTable');

/**
 * @description Função assíncrona para conectar ao banco de dados e verificar/criar a tabela de usuários.
 * @param {void} - Não recebe parâmetros.
 * @returns {void} - Não retorna nenhum valor.
 */
const connect = async () => {
  let connection; // Declaração da variável para armazenar a conexão

  try {
    // Obtém uma conexão do pool
    connection = await pool.getConnection();
    console.log('Conexão bem-sucedida ao banco de dados!');

    // Chama a função para verificar/criar a tabela de usuários
    // await createTable(connection);
  } catch (error) {
    // Exibe um erro caso ocorra algum problema na conexão ou na criação da tabela
    console.error('Erro ao conectar ao banco de dados:', error.message);
  } finally {
    // Libera a conexão ao final da operação
    if (connection) {
      connection.release();
    }
  }
};

// Exporta a função connect para ser utilizada em outros módulos
module.exports = connect;
