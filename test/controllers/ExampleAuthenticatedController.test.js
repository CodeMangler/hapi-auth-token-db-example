import bcrypt from 'bcrypt';
import { expect } from 'chai';
import Hapi from 'hapi';
import App from '../../src/App';
import models from '../../src/models/index';

describe('ExampleAuthenticatedController', () => {
  let server = null;
  let authToken = null;

  beforeEach(async () => {
    server = new Hapi.Server();
    await new App(server).configure();
    const hashedPassword = await bcrypt.hash('aPassword', 10);
    const user = await models.User.create({ username: 'aUser', passwordHash: hashedPassword });
    const newSession = await models.UserSession.newSessionFor(user.id);
    authToken = newSession.sessionToken;
  });

  afterEach(async () => {
    await models.UserSession.destroy({ where: {}, truncate: true, force: true });
    await models.User.destroy({ where: {}, force: true });
  });

  describe('GET /unprotected', () => {
    it('works without authentication', async () => {
      const response = await server.inject({
        url: '/unprotected',
        method: 'GET',
      });
      expect(response.statusCode).to.eq(200);
      expect(response.payload).to.eq('Unprotected');
    });
  });

  describe('GET /protected', () => {
    it('returns unauthorized without a valid authentication token', async () => {
      const response = await server.inject({
        url: '/protected',
        method: 'GET',
      });
      expect(response.statusCode).to.eq(401);
    });

    it('works with a token in query parameter', async () => {
      const response = await server.inject({
        url: `/protected?token=${authToken}`,
        method: 'GET',
      });
      expect(response.statusCode).to.eq(200);
      expect(response.payload).to.eq('Protected');
    });

    it('works with a token in Authorization header', async () => {
      const response = await server.inject({
        url: '/protected',
        method: 'GET',
        headers: { Authorization: `Token ${authToken}` },
      });
      expect(response.statusCode).to.eq(200);
      expect(response.payload).to.eq('Protected');
    });

    it('works with a token in the auth cookie', async () => {
      const authCookieContent = Buffer.from(JSON.stringify({ authToken })).toString('base64');
      const response = await server.inject({
        url: '/protected',
        method: 'GET',
        headers: { Cookie: `__AUTH=${authCookieContent};` },
      });
      expect(response.statusCode).to.eq(200);
      expect(response.payload).to.eq('Protected');
    });
  });
});
