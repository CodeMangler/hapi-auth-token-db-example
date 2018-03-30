const bcrypt = require('bcrypt');

module.exports = {
  up(queryInterface, _Sequelize) {
    return bcrypt.hash('aPassword', 10).then(passwordHash => queryInterface.bulkInsert('Users', [
      {
        username: 'aUser',
        passwordHash,
      },
    ]));
  },

  down(queryInterface, _Sequelize) {
    return queryInterface.bulkDelete('Users', { username: 'aUser' });
  },
};
