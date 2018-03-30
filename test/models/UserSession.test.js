/* eslint-disable no-unused-expressions */

import bcrypt from 'bcrypt';
import { expect } from 'chai';
import models from '../../src/models/index';

describe('UserSession', () => {
  let user = null;

  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash('aPassword', 10);
    user = await models.User.create({ username: 'aUser', passwordHash: hashedPassword });
  });

  afterEach(async () => {
    await models.UserSession.destroy({ where: {} });
    await models.User.destroy({ where: {} });
  });

  describe('.newSessionFor', () => {
    it('creates a new UserSession for the specified user', async () => {
      const sessionForUser = await models.UserSession.newSessionFor(user.id);
      expect(sessionForUser.userId).to.eq(user.id);
      expect(sessionForUser.sessionToken).not.to.be.null;
    });
  });

  describe('.byToken', () => {
    it('returns a session matching the specified token', async () => {
      const testSession = await models.UserSession.create({ userId: user.id, sessionToken: 'aToken' });

      const sessionFromDB = await models.UserSession.byToken('aToken');
      expect(sessionFromDB.id).to.eq(testSession.id);
    });

    it('returns null when a session matching the specified token is not available', async () => {
      const sessionFromDB = await models.UserSession.byToken('aToken');
      expect(sessionFromDB).to.be.null;
    });
  });

  describe('.clearFor', () => {
    it('removes all sessions matching the specified user id', async () => {
      await models.UserSession.newSessionFor(user.id);
      await models.UserSession.newSessionFor(user.id);
      await models.UserSession.newSessionFor(user.id);
      await models.UserSession.newSessionFor(user.id);

      await models.UserSession.clearFor(user.id);
      const userSessions = await models.UserSession.findAll({});
      expect(userSessions.length).to.eq(0);
    });
  });
});
