/**
 * @description Função assíncrona para verificar se existe a tabela de usuários, e criá-la caso não exista.
 * @param {Object} connection - Variável de conexão com o banco de dados.
 * @returns {Promise<void>} - Retorna uma Promise vazia.
 */
const createTable = async (connection) => {
  try {
    // Executa uma consulta SQL para verificar se a tabela de usuários já existe no banco de dados
    const [rows] = await connection.query("SHOW TABLES LIKE 'users';");

    // Se a consulta retornar 0 linhas, significa que a tabela não existe e precisa ser criada
    if (rows.length === 0) {
      // Query para criar a tabela de usuários com seus respectivos campos e tipos de dados
      const createTableQuery = `
        CREATE TABLE users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          date_of_birth DATE,
          phone VARCHAR(20),
          gender ENUM('Male', 'Female', 'Other'),
          profile_picture VARCHAR(255),
          bio TEXT,
          status ENUM('Active', 'Inactive') DEFAULT 'Active',
          city VARCHAR(100),
          street VARCHAR(255),
          postal_code VARCHAR(20),
          state VARCHAR(100),
          country VARCHAR(100),
          nationality VARCHAR(100),
          occupation VARCHAR(100),
          company VARCHAR(100),
          website VARCHAR(255),
          social_media JSON,
          interests JSON,
          skills JSON,
          education JSON,
          languages JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

      // Executa a query para criar a tabela
      await connection.query(createTableQuery);
      console.log('Tabela "users" criada com sucesso.');
    } else {
      // Se a tabela já existe, exibe uma mensagem informando que não é necessário criar novamente
      console.log('A tabela "users" já existe, não é necessário criar novamente.');
    }
  } catch (error) {
    // Captura e exibe qualquer erro ocorrido durante o processo de criação da tabela
    console.error('Erro ao criar a tabela de usuários:', error.message);
    throw error;
  }
};

// Exporta a função createTable para ser utilizada em outros módulos
module.exports = createTable;
