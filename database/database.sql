-- Cria o esquema `usuarios` se ele não existir, definindo o conjunto de caracteres padrão como utf8mb4
CREATE SCHEMA IF NOT EXISTS `usuarios` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Tabela de cargos dos usuários (substituindo ENUM)
CREATE TABLE user_roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insere valores iniciais para os cargos
INSERT INTO user_roles (role_name) VALUES ('user'), ('admin');

-- Tabela principal de usuários
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(10) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT DEFAULT 1, -- Cargo padrão será 'user'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES user_roles(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela para informações pessoais do usuário
CREATE TABLE personal_info (
    user_id INT PRIMARY KEY,
    first_name VARCHAR(100) NULL,
    last_name VARCHAR(100) NULL,
    birth_date DATE,
    phone VARCHAR(20),
    gender ENUM('male', 'female', 'other'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de países (substituindo VARCHAR por referência externa)
CREATE TABLE countries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    country_code CHAR(2) UNIQUE,
    country_name VARCHAR(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insere alguns exemplos de países
INSERT INTO countries (country_code, country_name) VALUES ('BR', 'Brazil'), ('US', 'United States');

-- Tabela de endereços do usuário
CREATE TABLE address (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    address_type ENUM('residential', 'business'),
    street VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country_id INT,  -- Referência à tabela de países
    postal_code VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Índice para melhorar a performance ao buscar pelo user_id
CREATE INDEX idx_user_id_address ON address(user_id);

-- Tabela de informações de contato do usuário
CREATE TABLE contact_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    phone_number VARCHAR(20) CHECK (phone_number REGEXP '^[0-9]+$'),
    alternate_email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de preferências do usuário
CREATE TABLE preferences (
    user_id INT PRIMARY KEY,
    preferred_language VARCHAR(50) DEFAULT 'en', -- Valor padrão: inglês
    receive_newsletter BOOLEAN DEFAULT TRUE,
    dark_mode BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de contas de redes sociais associadas ao usuário
CREATE TABLE social_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    platform_name VARCHAR(50),
    username VARCHAR(100),
    profile_link VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de métodos de pagamento (substituindo ENUM por tabela de métodos)
CREATE TABLE payment_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(50) UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insere valores iniciais para os tipos de pagamento
INSERT INTO payment_types (type_name) VALUES ('credit_card'), ('paypal'), ('bank_transfer');

-- Tabela de métodos de pagamento
CREATE TABLE payment_methods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    payment_type_id INT,  -- Relaciona com a tabela de tipos de pagamento
    provider VARCHAR(100),
    account_number VARCHAR(100),  -- Sugiro criptografar esse campo
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_type_id) REFERENCES payment_types(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de notificações
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    notification_text VARCHAR(255),
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE login_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    device_info VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Índice para melhorar performance ao buscar logins pelo user_id
CREATE INDEX idx_user_id_login_history ON login_history(user_id);

-- Tabela de amigos do usuário (com verificação para evitar auto-referência)
CREATE TABLE friends (
    user_id INT,
    friend_id INT,
    friendship_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, friend_id),
    CHECK (user_id != friend_id), -- Garante que o usuário não adicione a si mesmo
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de conquistas do usuário
CREATE TABLE achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    achievement_name VARCHAR(100),
    achievement_date DATE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de registro de atividades do usuário (com particionamento sugerido)
CREATE TABLE activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(255),
    action_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
PARTITION BY RANGE (YEAR(action_time)) (
    PARTITION p0 VALUES LESS THAN (2025),
    PARTITION p1 VALUES LESS THAN (2026),
    PARTITION p2 VALUES LESS THAN (2027)
);

-- Tabela de tickets de suporte
CREATE TABLE support_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    subject VARCHAR(255),
    description TEXT,
    status ENUM('open', 'closed', 'pending') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Cria a view para consolidar as informações do usuário
CREATE VIEW user_summary AS
SELECT 
    u.id AS user_id,
    u.username,
    u.email,
    u.created_at AS user_created_at,
    u.updated_at AS user_updated_at,
    pi.first_name,
    pi.last_name,
    pi.birth_date,
    pi.phone AS personal_phone,
    pi.gender,
    a.street,
    a.city,
    a.state,
    c.country_name AS country,
    a.postal_code,
    ci.phone_number AS contact_phone_number,
    ci.alternate_email,
    p.preferred_language,
    p.receive_newsletter,
    p.dark_mode,
    sa.platform_name,
    sa.username AS social_username,
    sa.profile_link,
    pm.provider,
    pm.account_number,
    pm.expiry_date,
    n.notification_text,
    f.friend_id,
    ach.achievement_name,
    ach.achievement_date,
    ach.description AS achievement_description,
    st.subject AS ticket_subject,
    st.description AS ticket_description,
    st.status AS ticket_status
FROM users u
LEFT JOIN personal_info pi ON u.id = pi.user_id
LEFT JOIN address a ON u.id = a.user_id
LEFT JOIN countries c ON a.country_id = c.id
LEFT JOIN contact_info ci ON u.id = ci.user_id
LEFT JOIN preferences p ON u.id = p.user_id
LEFT JOIN social_accounts sa ON u.id = sa.user_id
LEFT JOIN payment_methods pm ON u.id = pm.user_id
LEFT JOIN notifications n ON u.id = n.user_id
LEFT JOIN friends f ON u.id = f.user_id
LEFT JOIN achievements ach ON u.id = ach.user_id
LEFT JOIN support_tickets st ON u.id = st.user_id;
