# Taotie Logger

[![npm][badge-version]][npm]
[![npm downloads][badge-downloads]][npm]
[![license][badge-license]][license]


[![github][badge-issues]][github]

Logger client of [Taotie][taotie], transport logs by stdout and udp.

## Installation

```sh
npm install @taotiejs/logger
```

## Usage

```js
const logger = require('@taotiejs/logger');

logger.configuer({
  project: 'PROJECT NAME',
  console: {
    level: trace,
  },
  udp: process.env.NODE_ENV == 'production',
  serializers: {},
});
```

## Server

You may use [`@taotiejs/server`][taotie] for log collecting and querying.

[taotie]: https://github.com/taotiejs/taotie-server

[badge-version]: https://img.shields.io/npm/v/@taotiejs%2Flogger.svg
[badge-downloads]: https://img.shields.io/npm/dt/@taotiejs%2Flogger.svg
[npm]: https://www.npmjs.com/package/@taotiejs%2Flogger

[badge-size]: https://img.shields.io/bundlephobia/minzip/@taotiejs%2Flogger.svg
[bundlephobia]: https://bundlephobia.com/result?p=@taotiejs%2Flogger

[badge-license]: https://img.shields.io/npm/l/@taotiejs%2Flogger.svg
[license]: https://github.com/taotiejs/taotie-logger/blob/master/LICENSE

[badge-issues]: https://img.shields.io/github/issues/taotiejs/taotie-logger.svg
[github]: https://github.com/taotiejs/taotie-logger

[badge-build]: https://img.shields.io/travis/com/taotiejs/taotie-logger/master.svg
[travis]: https://travis-ci.com/taotiejs/taotie-logger

[badge-coverage]: https://img.shields.io/coveralls/github/taotiejs/taotie-logger/master.svg
[coveralls]: https://coveralls.io/github/taotiejs/taotie-logger?branch=master
