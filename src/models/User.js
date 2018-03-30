import bcrypt from 'bcrypt';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: DataTypes.STRING,
    passwordHash: DataTypes.STRING,
  }, {});

  User.matchingUsernamePassword = async (username, password) => {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return null;
    }
    const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordsMatch) {
      return null;
    }
    return user;
  };
  return User;
};
