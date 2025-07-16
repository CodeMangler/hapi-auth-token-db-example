#!/bin/bash
set -e
yarn sequelize db:migrate
yarn mocha --exit --require babel-core/register --require babel-polyfill test/**/*.test.js
