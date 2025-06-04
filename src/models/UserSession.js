import crypto from 'crypto';

module.exports = (sequelize, DataTypes) => {
  const UserSession = sequelize.define('UserSession', {
    userId: DataTypes.INTEGER,
    sessionToken: DataTypes.STRING,
  }, {});

  UserSession.associate = (models) => {
    UserSession.belongsTo(models.User, { foreignKey: 'userId' });
  };

  UserSession.newSessionFor = (userId) => {
    const newSessionToken = crypto.randomBytes(32).toString('hex');
    return UserSession.create({ userId, sessionToken: newSessionToken });
  };

  UserSession.byToken = token => UserSession.findOne({ where: { sessionToken: token } });

  UserSession.clearFor = userId => UserSession.destroy({ where: { userId } });
  return UserSession;
};
