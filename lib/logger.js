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

function noConfig() {
  console.error(new Error('Please configure logger'));
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
            const others = [];
            const msgs = [];
            let req;
            let res;
            let err;
            let obj;
            // eslint-disable-next-line no-cond-assign
            for (let j = 0, arg = args[0]; arg = args[j]; j++) {
              if (arg) {
                if (arg instanceof IncomingMessage) {
                  req = arg;
                } else if (arg instanceof ServerResponse) {
                  res = arg;
                } else if (arg.req instanceof IncomingMessage && arg.res instanceof ServerResponse) {
                  // eslint-disable-next-line prefer-destructuring
                  req = arg.req;
                  // eslint-disable-next-line prefer-destructuring
                  res = arg.res;
                } else if (arg instanceof Error) {
                  err = arg;
                } else {
                  (typeof arg === 'string' ? msgs : others).push(arg);
                }
              }
            }
            if (others.length) {
              obj = others.length === 1 ? others[0] : {
                objects: others,
              };
            }
            obj = Object.assign(
              {},
              err ? { err } : undefined,
              req ? { req } : undefined,
              res ? { res } : undefined,
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
  project = config.project; // eslint-disable-line prefer-destructuring
  if (!project) {
    throw new Error('"project" must be specific');
  }
  logger = pino(config);
};
