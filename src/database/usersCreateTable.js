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
      CREATE TABLE IF NOT EXISTS \`usuarios\`.\`users\` (
        id INT PRIMARY KEY,
        username VARCHAR(255) UNIQUE,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        password VARCHAR(255),
        age INT,
        phone VARCHAR(20),
        gender VARCHAR(10),
        date_of_birth DATE,
        created_at DATETIME
      );

      CREATE TABLE IF NOT EXISTS \`usuarios\`.\`addresses\` (
        user_id INT PRIMARY KEY,
        street VARCHAR(255),
        city VARCHAR(255),
        state VARCHAR(2),
        postal_code VARCHAR(10),
        country VARCHAR(50),
        FOREIGN KEY (user_id) REFERENCES \`usuarios\`.\`users\`(id)
      );

      CREATE TABLE IF NOT EXISTS \`usuarios\`.\`social_info\` (
        user_id INT PRIMARY KEY,
        profile_picture VARCHAR(255),
        bio TEXT,
        status VARCHAR(20),
        website VARCHAR(255),
        occupation VARCHAR(255),
        company VARCHAR(255),
        language VARCHAR(50),
        FOREIGN KEY (user_id) REFERENCES \`usuarios\`.\`users\`(id)
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
