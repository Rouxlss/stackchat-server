const client = require('./connection');

const redis = {}

redis.getKey = (code) => client.get(code);

redis.setSessionTokenKey = (key, value) => {
    console.log('key', key);
    console.log('value', value);
    client.set(
        key,
        value,
    );
};

redis.sendCode = (key, value) => {
    console.log('key', key);
    console.log('value', value);
    client.set(
        key,
        value,
        'EX',
        process.env.REDIS_TTL_CODE,
    );
}

redis.removeToken = (key) => {

    console.log('key', key);

    try {
        client.del(key);
    } catch (error) {
        console.log(error);
    }
}

// const setValidationCode = (email, code) => {
//     client.set(
//         email,
//         code,
//         'EX',
//         60 * process.env.REDIS_VERIFICATION_EX_TIME,
//         (err) => {
//             if (err) {
//                 return logger.error(err);
//             }
//         }
//     );
//     return code;
// };

// const setPwdResetVerificationCode = (email, code) => {
//     client.set(
//         email,
//         code,
//         'EX',
//         60 * process.env.REDIS_PWDRESET_EX_TIME,
//         (err) => {
//             if (err) {
//                 return logger.error(err);
//             }
//         }
//     );
//     return code;
// };

// const removeKey = (key, callback) => client.del(key, callback);

// const deleteKeysByPattern = (pattern) => {
//     const stream = client.scanStream({ match: pattern });
//     let pipeline = client.pipeline();
//     let localKeys = [];

//     stream.on('data', (resultKeys) => {
//         console.log('Data Received', localKeys.length);

//         for (let i = 0; i < resultKeys.length; i += 1) {
//             localKeys.push(resultKeys[i]);
//             pipeline.del(resultKeys[i]);
//         }

//         if (localKeys.length > 100) {
//             pipeline.exec(() => {
//                 console.log('one batch delete complete');
//             });
//             localKeys = [];
//             pipeline = client.pipeline();
//         }
//     });
//     stream.on('end', () => {
//         pipeline.exec(() => {
//             console.log('final batch delete complete');
//         });
//     });
//     stream.on('error', (err) => {
//         logger.error(err);
//     });
// };




module.exports = redis;
