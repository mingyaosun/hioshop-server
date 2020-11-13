const mysql = require('think-model-mysql');

module.exports = {
    handle: mysql,
    database: 'hiolabsDB',
    prefix: 'hiolabs_',
    encoding: 'utf8mb4',
    host: '8.131.92.54',
    port: '3306',
    user: 'root',
    password: 'sunmingyao',
    dateStrings: true
};
