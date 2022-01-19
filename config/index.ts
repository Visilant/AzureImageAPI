require('dotenv').config()

import fs from 'fs';
import path from 'path';

const isCompiled:Boolean = path.extname(__filename).includes('js');

function loadDbConfig () {
    if (fs.existsSync(path.join(__dirname, `./database.${isCompiled ? "js" : "ts"}`))) {
        return require('./database');
    }
    throw new Error('Database configuration is required')
}

const ENV = process.env.NODE_ENV || 'testingVisilant';
const envConfig = require(path.join(__dirname, 'environments', ENV));

const dbConfig = loadDbConfig();

const config = Object.assign({
    env: ENV,
    db: dbConfig,
}, envConfig)

export default config;