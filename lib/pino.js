const { Writable } = require('stream');
const dgram = require('dgram');
const pinoms = require('pino-multi-stream');
const { stdSerializers } = require('pino');
const { getPrettyStream } = require('pino/lib/tools');

module.exports = function pino(options = {}) {
  const {
    console = {},
    udp = {},
    serializers = {},
  } = options;
  const socket = udp && dgram.createSocket('udp4');
  return pinoms(Object.assign({}, options, {
    serializers: Object.assign({
      request(request) {
        return {
          method: request.method,
          url: request.url,
          header: request.header,
          body: request.body,
        };
      },
      response(response) {
        return {
          status: response.status,
          header: response.header,
          body: response.body,
        };
      },
    }, stdSerializers, serializers),
    streams: [
      console && {
        level: console.level || 'trace',
        stream: getPrettyStream({
          translateTime: true,
          ignore: 'project',
        }, undefined, process.stdout),
      },
      udp && {
        level: udp.level || 'trace',
        stream: new Writable({
          close() {
            socket.close();
          },
          write(data, encoding, callback) {
            socket.send(data, 0, data.length, udp.port || 514, udp.host || '127.0.0.1');
            callback();
          },
        }),
      },
    ].map(s => s),
  }));
};
