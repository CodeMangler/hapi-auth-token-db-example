# hapi-auth-token Database Authentication Example

[![Build Status](https://travis-ci.org/CodeMangler/hapi-auth-token-db-example.svg?branch=master)](https://travis-ci.org/CodeMangler/hapi-auth-token-db-example)
[![Coverage Status](https://coveralls.io/repos/github/CodeMangler/hapi-auth-token-db-example/badge.svg?branch=master)](https://coveralls.io/github/CodeMangler/hapi-auth-token-db-example?branch=master)

This is an example Hapi application to demonstrate usage of the [hapi-auth-token](https://github.com/CodeMangler/hapi-auth-token) plugin with users from a SQL database.
It uses `sequelize` to connect to an RDBMS, which is assumed to be Postgre by default.
But you can obviously connect to any other database by installing the appropriate database adapters, and updating `config/database.json` to point to that DB.

This example generates a random cryptographic hash and uses that as the auth token.
See [hapi-auth-token-jwt-example](https://github.com/CodeMangler/hapi-auth-token-jwt-example) for an example that shows how to use JWT tokens instead.

## Setup
- Create a database called `api_development`
- Create `config/database.json` from `config/database.example.json` and update it to point to the newly created database
- `yarn install`
- Run migrations to create the relevant tables
  ```bash
  yarn run migrate
  ```
- Run seeds to create an initial user
  ```bash
  yarn run seed
  ```
- Run the server
  ```bash
  yarn start
  ```
- Navigate to [http://localhost:3000/documentation](http://localhost:3000/documentation) to access Swagger documentation for the API and play around with it

## Code Walkthrough
In `App.js`, we begin by registering the `HapiAuthToken` plugin, and in the `_configureAuth` method, we configure an authentication strategy using the plugin.
The authentication strategy overrides some of the cookie options to set the auth cookie name to `__AUTH`, and marks it an insecure cookie (to allow it to be accessed over HTTP in the demo application).
You can turn off cookie authentication by simply setting `cookie: false` in these options.
Similarly, `header: false` and `query: false` will respectively turn off `Authorization` header and query parameter token authentication.

The most important options in strategy configuration are the `validateToken` and `buildAuthCredentials` functions.
The plugin will extract an authentication token from the request, and call `validateToken` with it.
`validateToken` is expected to validate this token and respond back with a boolean indicating whether the token is valid.
If `validateToken` returns true, then the plugin calls the `buildAuthCredentials` function with the same auth token.
`buildAuthCredentials` is expected to return a JSON object, which will be set as the auth credentials for the current request.
This object will be accessible as `request.auth.credentials` in the route endpoints (if the token was successfully validated).

The app has a `User` and `UserSession` models. `UserSession` keeps track of session/auth tokens that have been issued to a user.
These models are used during authentication, and for validating tokens extracted from the request (in `validateToken`).

`AuthenticationController` has a `login` route which tries to match the supplied `username` and `password` against the `users` table.
If a match is found:
  - it creates a new `UserSession` for the user
  - returns session token from `UserSession` as the auth token
  - also sets this token on the auth cookie

This is just an example implementation. The key here is the authentication strategy configuration, and particularly the `validateToken` and `buildAuthCredentials` methods.
In your implementation, you just have to implement these to work with your DB model.
In addition, if you choose to support cookie authentication, then remember to set the session/auth token on your auth cookie in your authentication controller (see `AuthenticationController#_create` for example).

## To try out the API
- Start the server (`yarn start`)
- Open the swagger documentation ([http://localhost:3000/documentation](http://localhost:3000/documentation))
- Invoke the `/login` endpoint with:
  ```json
  {
    "username": "aUser",
    "password": "aPassword"
  }
  ```
- Take note of the token returned by this request
- Invoke `/protected` with this token in either the authorization header (`Authorization: Token <token-value>`) or the `token` query parameter
- `/protected` should respond back with a `200`
