import bcrypt from 'bcrypt';
import { expect } from 'chai';
const Hapi = require('@hapi/hapi');
import App from '../../src/App';
import models from '../../src/models/index';

describe('AuthenticationController', () => {
  let server = null;
  let user = null;

  beforeEach(async () => {
    server = Hapi.server();
    await new App(server).configure();
    const hashedPassword = await bcrypt.hash('aPassword', 10);
    user = await models.User.create({ username: 'aUser', passwordHash: hashedPassword });
  });

  afterEach(async () => {
    await models.UserSession.destroy({ where: {}, truncate: true, force: true });
    await models.User.destroy({ where: {}, force: true });
  });

  describe('POST /login', () => {
    it('creates a new UserSession if the credentials are correct', async () => {
      const response = await server.inject({
        url: '/login',
        method: 'POST',
        payload: JSON.stringify({ username: 'aUser', password: 'aPassword' }),
      });
      expect(response.statusCode).to.eq(200);
      const userSessions = await models.UserSession.findAll();
      expect(userSessions.length).to.eq(1);
      expect(response.payload).to.eq(userSessions[0].sessionToken);
    });

    it(
      'responds with unauthorized without creating a session when the credentials are incorrect',
      async () => {
        const response = await server.inject({
          url: '/login',
          method: 'POST',
          payload: JSON.stringify({ username: 'aUser', password: 'invalidPassword' }),
        });
        expect(response.statusCode).to.eq(401);
        const userSessions = await models.UserSession.findAll();
        expect(userSessions.length).to.eq(0);
      },
    );
  });

  describe('DELETE /logout', () => {
    it('removes all current sessions for the logged in user', async () => {
      const userSession = await models.UserSession.newSessionFor(user.id);

      await server.inject({
        url: '/logout',
        method: 'DELETE',
        headers: { Authorization: `Token ${userSession.sessionToken}` },
      });
      const userSessions = await models.UserSession.findAll();
      expect(userSessions.length).to.eq(0);
    });
  });
});
