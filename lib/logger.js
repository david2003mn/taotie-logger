/* eslint-disable prefer-destructuring */

const path = require('path');
const {
  IncomingMessage,
  ServerResponse,
} = require('http');
const pino = require('./pino');

const levels = [
  'trace',
  'debug',
  'info',
  'warn',
  'error',
  'fatal',
];

let logger;
let project;
let recognizer;

function noConfig() {
  throw new Error('logger is not configured');
}

module.exports = function getLogger(filename) {
  const levelLoggers = {};
  let childLogger;
  let extIndex;
  let module;
  if (filename) {
    extIndex = filename.lastIndexOf('.');
    if (extIndex > -1) {
      filename = filename.substr(0, extIndex);
    }
    module = path.relative('./', filename).replace(path.sep === '/' ? /\//g : /\\/g, '/');
  }

  function log(name) {
    return (levelLoggers[name] || childLogger[name]);
  }

  return new Proxy({}, {
    get(target, name) {
      if (childLogger) {
        return log(name);
      }
      if (logger) {
        childLogger = logger.child({
          project,
          module,
        });
        levels.forEach((level) => {
          levelLoggers[level] = (...args) => {
            const arrays = [];
            const objects = [];
            const msgs = [];
            let req;
            let res;
            let err;
            let arr;
            let obj;

            if (recognizer) {
              args = recognizer(args);
            }

            for (let j = 0; j < args.length; j++) {
              const arg = args[j];
              if (arg != null) {
                if (arg instanceof IncomingMessage) {
                  req = arg;
                } else if (arg instanceof ServerResponse) {
                  res = arg;
                } else if (arg instanceof Error) {
                  err = arg;
                } else if (Array.isArray(arg)) {
                  arrays.push(arg);
                } else if (typeof arg === 'object') {
                  objects.push(arg);
                } else {
                  msgs.push(arg);
                }
              }
            }
            if (arrays.length) {
              arr = {
                arrays,
              };
            }
            if (objects.length) {
              obj = objects.length === 1 ? objects[0] : {
                objects,
              };
            }
            obj = Object.assign(
              {},
              err ? { err } : undefined,
              req ? { req } : undefined,
              res ? { res } : undefined,
              arr,
              obj,
            );
            if (Object.keys(obj).length) {
              msgs.unshift(obj);
            }
            childLogger[level](...msgs);
          };
        });
        return log(name);
      }
      return noConfig;
    },
  });
};

module.exports.configure = function configure(config) {
  project = config.project;
  recognizer = config.recognizer;
  if (!project) {
    throw new Error('"project" must be specific');
  }
  logger = pino(config);
};
