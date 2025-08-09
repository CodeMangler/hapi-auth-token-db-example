/* eslint-disable class-methods-use-this */

import Boom from '@hapi/boom';
import Joi from 'joi';
import models from '../models/index';

export default class AuthenticationController {
  constructor(server) {
    this._server = server;
    this._configureRoutes();
  }

  _configureRoutes() {
    this._server.route({
      method: 'POST',
      path: '/login',
      handler: this._create,
      config: {
        validate: {
          payload: Joi.object({
            username: Joi.string().required(),
            password: Joi.string().min(2).max(200).required(),
          }),
        },
        auth: false,
        tags: ['api'],
        description: 'Get authentication token',
        notes: 'Responds with an authentication token for the provided credentials and sets a cookie',
      },
    });
    this._server.route({
      method: 'DELETE',
      path: '/logout',
      handler: this._delete,
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
        description: 'Invalidate authentication token',
        notes: 'Invalidates authentication tokens for the current users and clears any active sessions',
      },
    });
  }

  async _create(request, h) {
    const matchingUser = await models.User.matchingUsernamePassword(
      request.payload.username,
      request.payload.password,
    );

    if (matchingUser) {
      const newSession = await models.UserSession.newSessionFor(matchingUser.id);
      const sessionCookie = { authToken: newSession.sessionToken };
      // Return the JWT token in response body, AND set it on the auth cookie
      return h.response(newSession.sessionToken).state('__AUTH', sessionCookie);
    }

    return Boom.unauthorized('Invalid username or password');
  }

  async _delete(request, h) {
    await models.UserSession.clearFor(request.auth.credentials.id);
    return h.response('Logout Successful').unstate('__AUTH');
  }
}
