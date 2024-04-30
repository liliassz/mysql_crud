function validateUser(userData) {
    const { username, first_name, last_name, email, password } = userData;
    const errors = [];
  
    const fields = [
      { name: 'Nome de usuário', value: username, maxLength: 10 },
      { name: 'Nome', value: first_name, maxLength: 10 },
      { name: 'Sobrenome', value: last_name, maxLength: 10 },
      { name: 'Email', value: email },
      { name: 'Senha', value: password }
    ];
  
    fields.forEach(field => {
      if (!field.value) {
        errors.push(`${field.name} é obrigatório.`);
      } else if (field.maxLength && field.value.length > field.maxLength) {
        errors.push(`${field.name} deve ter no máximo ${field.maxLength} caracteres.`);
      }
    });
  
    return { isValid: errors.length === 0, errors };
  }
  
  module.exports = validateUser;
  