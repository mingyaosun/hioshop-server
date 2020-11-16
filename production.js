const Application = require('thinkjs');

const instance = new Application({
  ROOT_PATH: process.cwd(),
  proxy: true, // use proxy
  env: 'production'
});

instance.run();
