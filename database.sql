-- Cria o esquema `usuarios` se ele não existir, definindo o conjunto de caracteres padrão como utf8
CREATE SCHEMA IF NOT EXISTS `usuarios` DEFAULT CHARACTER SET utf8 ;

-- Cria a tabela `users` para armazenar informações básicas do usuário
CREATE TABLE `users` (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(10) UNIQUE,
    first_name VARCHAR(10),
    last_name VARCHAR(10),
    email VARCHAR(255) UNIQUE ,
    password VARCHAR(255),
    age INT,
    phone VARCHAR(20),
    gender ENUM('homem', 'mulher', 'outros'),
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Cria a tabela `address` para armazenar endereços dos usuários com chave estrangeira referenciando `users`
CREATE TABLE `address` (
    user_id INT PRIMARY KEY,
    street VARCHAR(255),
    city VARCHAR(255),
    state VARCHAR(2),
    postal_code VARCHAR(10),
    country VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES `users`(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Cria a tabela `social_info` para armazenar informações sociais e profissionais dos usuários
CREATE TABLE `social_info` (
    user_id INT PRIMARY KEY,
    profile_picture VARCHAR(255),
    bio TEXT,
    status ENUM('ativo', 'desativado') DEFAULT 'ativo',
    website VARCHAR(255),
    occupation VARCHAR(255),
    company VARCHAR(255),
    skill VARCHAR(255),
    language VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES `users`(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Cria uma visualização `user_full_details` que combina dados das tabelas `users`, `address`, e `social_info`
CREATE VIEW `user_full_details` AS
SELECT 
    u.id,
    u.username,
    u.first_name,
    u.last_name,
    u.email,
    u.password,
    u.age,
    u.phone,
    u.gender,
    u.date_of_birth,
    u.created_at,
    u.updated_at,
    a.street,
    a.city,
    a.state,
    a.postal_code,
    a.country,
    s.profile_picture,
    s.bio,
    s.status,
    s.website,
    s.occupation,
    s.company,
    s.skill,
    s.language
FROM 
    `users` u
LEFT JOIN 
    `address` a ON u.id = a.user_id
LEFT JOIN 
    `social_info` s ON u.id = s.user_id;