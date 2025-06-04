/* eslint-disable global-require,no-new,import/no-dynamic-require */

import Blipp from 'blipp';
import fs from 'fs';
import HapiAuthToken from 'hapi-auth-token';
import HapiSwagger from 'hapi-swagger';
import Inert from '@hapi/inert';
import path from 'path';
import Vision from '@hapi/vision';
import models from './models';

export default class App {
  constructor(server) {
    this._server = server;
  }

  async configure() {
    await this._registerPlugins();
    this._configureAuth();
    this._loadControllers();
  }

  async _registerPlugins() {
    await this._server.register(Blipp);

    // Register hapi-auth-token
    await this._server.register(HapiAuthToken);

    // Register hapi-swagger and it's peer dependencies
    await this._server.register(Inert);
    await this._server.register(Vision);
    await this._server.register(HapiSwagger);
  }

  _configureAuth() {
    this._server.auth.strategy('api', 'token-auth', {
      cookie: {
        name: '__AUTH',
        isSecure: false,
      },

      async validateToken(authToken) {
        const userSession = await models.UserSession.byToken(authToken);
        return !!authToken && userSession;
      },

      async buildAuthCredentials(authToken) {
        const userSession = await models.UserSession.byToken(authToken);
        return { id: userSession.userId };
      },
    });
    this._server.auth.default('api');
  }

  _loadControllers() {
    fs.readdirSync(path.join(__dirname, 'controllers'))
      .filter(file => (file.indexOf('.') !== 0) && (file.slice(-3) === '.js'))
      .forEach((file) => {
        const Controller = require(path.resolve(__dirname, 'controllers', file)).default;
        new Controller(this._server);
      });
  }

  async start() {
    await this.configure();
    this._server.start();
  }
}
