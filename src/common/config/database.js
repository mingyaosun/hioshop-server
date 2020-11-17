const mysql = require('think-model-mysql');

module.exports = {
    handle: mysql,          //勿改动
    database: 'hiolabsDB',    //数据库名
    prefix: 'hiolabs_',     //数据库表名前缀，如果要改，同时需替换sql文件中所有出现的该词
    encoding: 'utf8mb4',    //勿改动
    host: '8.131.92.54',      //数据库地址，默认本地，如果server和数据库在同一台电脑即可写本地127.0.0.1
    port: '3306',           //数据库端口
    user: 'root',           //数据库用户名，建议新建一个用户拥有此表权限即可，root不安全
    password: 'sunmingyao',     //数据库用户名对应的密码
    dateStrings: true       //勿改动
};
