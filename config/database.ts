import path from 'path';
const dotEnvPath = path.resolve('.env')

require('dotenv').config({ path: dotEnvPath })

export = {
    type: 'mysql',
    host: process.env.DATABASE_SERVER,
    port: process.env.DATABASE_PORT,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DB,
    synchronize: true,
    logging: false
}