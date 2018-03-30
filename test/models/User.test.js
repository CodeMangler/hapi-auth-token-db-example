/* eslint-disable no-unused-expressions */

import bcrypt from 'bcrypt';
import { expect } from 'chai';
import models from '../../src/models/index';

describe('User', () => {
  afterEach(async () => {
    await models.UserSession.destroy({ where: {} });
    await models.User.destroy({ where: {} });
  });

  describe('.matchingUsernameAndPassword', () => {
    it('returns a user matching the username and password if found', async () => {
      const hashedPassword = await bcrypt.hash('aPassword', 10);
      const user = await models.User.create({ username: 'aUser', passwordHash: hashedPassword });
      const userFromDB = await models.User.matchingUsernamePassword('aUser', 'aPassword');
      expect(userFromDB).not.to.be.null;
      expect(userFromDB.id).to.eq(user.id);
    });

    it('returns null if there is no user matching the specified username', async () => {
      const hashedPassword = await bcrypt.hash('aPassword', 10);
      await models.User.create({ username: 'aUser', passwordHash: hashedPassword });
      const userFromDB = await models.User.matchingUsernamePassword('invalidUsername', 'aPassword');
      expect(userFromDB).to.be.null;
    });

    it('returns null if the specified password does not match password of the user', async () => {
      const hashedPassword = await bcrypt.hash('aPassword', 10);
      await models.User.create({ username: 'aUser', passwordHash: hashedPassword });
      const userFromDB = await models.User.matchingUsernamePassword('aUser', 'invalidPassword');
      expect(userFromDB).to.be.null;
    });
  });
});
