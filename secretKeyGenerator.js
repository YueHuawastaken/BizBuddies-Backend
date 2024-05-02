const crypto = require('crypto');

generateSecretKey = () => {
    return crypto.randomBytes(32).toString('hex')       //hex format rather than UTF
}

console.log(generateSecretKey());