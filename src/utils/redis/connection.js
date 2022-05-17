const Redis = require('ioredis');
const { DEV_MODE } = process.env;
console.log('DEV_MODE', DEV_MODE);

let client;

if (DEV_MODE == 'true') {
    client = new Redis({
        host: 'localhost',
        port: '6379',
    });
} else {
    client = new Redis({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
    });
}
module.exports = client;