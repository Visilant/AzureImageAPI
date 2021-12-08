import { connectDatabase } from './src/infra/TypeORM';
import express, { Request, Response, NextFunction, Router } from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import controller from './src/infra/Controller';
import database from './config/database';
import fs from 'fs';
import https from 'https';

const app: express.Application = express();

app.disable('x-powered-by');
app.use(cookieParser())
app.use((req: Request, res: Response, next: NextFunction) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
})

app.use(logger('dev'));
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const router = Router();
const apiRouter = Router();

apiRouter.use('/image', controller('image'))
router.use(`/api/v1`, apiRouter)
app.use(router)

const port = process.env.port || '3000';
app.set('port', port);

const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/testing.visilant.org/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/testing.visilant.org/fullchain.pem')
};

https.createServer(options, app).listen(port, () => {
    connectDatabase(database)
    console.log(`Express running on port ${port}`);
});

// app.listen(port, () => {
//     connectDatabase(database)
//     console.log(`Express running on port ${port}`);
// })
