import { createConnection } from 'typeorm';
import fs from 'fs';
import path from 'path';
import "reflect-metadata";

export const connectDatabase = (config: any) => {
    let isCompiled: Boolean = false;
    fs.readdirSync(`src/entity`).forEach(file => {
        if (file) {
            isCompiled = path.extname(file).includes('js');
        }
    });
    createConnection({
        ...config,
        "entities": [
            `src/entity/*.${isCompiled ? 'js' : 'ts'}`
        ]
    }).then(connection => {
        console.log('Database is connected')
    }).catch(error => console.log(error));
}
