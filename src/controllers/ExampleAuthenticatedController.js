/* eslint-disable class-methods-use-this */

import Joi from 'joi';

export default class ExampleAuthenticatedController {
  constructor(server) {
    this._server = server;
    this._configureRoutes();
  }

  _configureRoutes() {
    this._server.route({
      method: 'GET',
      path: '/unprotected',
      config: {
        auth: false,
        tags: ['api'],
        description: 'Example unauthenticated route',
        notes: 'Authentication has been disabled for this endpoint',
      },
      handler: this._unprotectedEndpoint,
    });
    this._server.route({
      method: 'GET',
      path: '/protected',
      handler: this._protectedEndpoint,
      config: {
        validate: {
          query: Joi.object({
            token: Joi.string(),
          }),
          headers: Joi.object({
            Authorization: Joi.string(),
          }).unknown(),
        },
        tags: ['api'],
        description: 'Example authenticated route',
        notes: 'This endpoint requires a valid authentication token to be passed via either the "__AUTH" cookie, "Authorization" header or the token "query" parameter',
      },
    });
  }

  _unprotectedEndpoint(_request, _h) {
    return 'Unprotected';
  }

  _protectedEndpoint(_request, _h) {
    return 'Protected';
  }
}
