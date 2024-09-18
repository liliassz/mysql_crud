-- Insere um usuário
INSERT INTO users (username, email, password_hash, role_id) 
VALUES ('johnsdoe', 'johoe@example.com', 'hashed_password', 1);

-- Insere informações pessoais
INSERT INTO personal_info (user_id, first_name, last_name, birth_date, phone, gender)
VALUES (1, 'John', 'Doe', '1990-01-01', '1234567890', 'male');

-- Insere endereços
INSERT INTO address (user_id, address_type, street, city, state, country_id, postal_code)
VALUES (1, 'residential', '123 Elm St', 'Springfield', 'IL', (SELECT id FROM countries WHERE country_code = 'US'), '62701');

-- Insere informações de contato
INSERT INTO contact_info (user_id, phone_number, alternate_email)
VALUES (1, '1234567890', 'contact1@example.com');

-- Insere preferências
INSERT INTO preferences (user_id, preferred_language, receive_newsletter, dark_mode)
VALUES (1, 'en', TRUE, FALSE);

-- Insere contas de redes sociais
INSERT INTO social_accounts (user_id, platform_name, username, profile_link)
VALUES (1, 'Facebook', 'johndoe_fb', 'https://facebook.com/johndoe_fb'),
       (1, 'Twitter', 'johndoe_tw', 'https://twitter.com/johndoe_tw');

-- Insere métodos de pagamento
INSERT INTO payment_methods (user_id, payment_type_id, provider, account_number, expiry_date)
VALUES (1, (SELECT id FROM payment_types WHERE type_name = 'credit_card'), 'Visa', '4111111111111111', '2025-12-31');

-- Insere notificações
INSERT INTO notifications (user_id, notification_text)
VALUES (1, 'Welcome to our service!');

-- Insere amigos
INSERT INTO friends (user_id, friend_id)
VALUES (1, 2);

-- Insere conquistas
INSERT INTO achievements (user_id, achievement_name, achievement_date, description)
VALUES (1, 'First Login', '2024-01-01', 'Achievement for the first login.');

-- Insere tickets de suporte
INSERT INTO support_tickets (user_id, subject, description, status)
VALUES (1, 'Login Issue', 'Unable to log in with my credentials.', 'open'),
       (1, 'Password Reset', 'Request to reset my password.', 'pending');

INSERT INTO support_tickets (user_id, subject, description, status, created_at, updated_at) 
VALUES (2, 'Login2 Issue', 'Unable to log in with my credentials.', 'closed', '2024-08-01', '2024-08-05');

INSERT INTO support_tickets (user_id, subject, description, status, created_at, updated_at) 
VALUES (3, 'Password2 Reset', 'Request to reset my password.', 'pending', '2024-09-10', '2024-09-10');
