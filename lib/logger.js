const path = require('path');
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
            const texts = [];
            const others = [];
            let msgs = [];
            let koaContext;
            let error;
            // eslint-disable-next-line no-cond-assign
            for (let j = 0, arg = args[0]; arg = args[j]; j++) {
              if (arg.request && arg.response) {
                koaContext = Object.assign({}, arg, {
                  request: arg.request,
                  response: arg.response,
                  req: undefined,
                  res: undefined,
                  log: undefined,
                });
              } else if (arg instanceof Error) {
                error = arg;
              } else {
                (typeof arg === 'string' ? texts : others).push(arg);
              }
            }
            if (others.length) {
              msgs.unshift(others.length === 1 ? others[0] : others);
            }
            msgs = msgs.concat(texts);
            if (error || koaContext) {
              koaContext && childLogger[level](koaContext, ...texts);
              error && childLogger[level](error, ...texts);
            } else {
              childLogger[level](...msgs);
            }
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
