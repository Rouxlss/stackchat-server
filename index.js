require('dotenv').config();

const app = require('./src/app');
require('./src/utils/database'); 

const dev_mode = process.env.DEV_MODE;

async function main () {
    await app.listen(app.get('port'));
    console.log('Server is running on port', app.get('port'));
    dev_mode == 'true' 
        ? console.log('Redis is running in development mode') 
        : console.log('Redis is running in production mode', process.env.REDIS_HOST);
}

main();