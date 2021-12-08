import { uploadImage } from './../Azure/index';
import { Response, Request } from 'express';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log(`${__dirname}/../../../upload`)
        cb(null, `${__dirname}/../../../upload`)
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
})

const upload = multer({ storage: storage }).single('file');

export const azureBlob = async (req: Request, res: Response) => {
    return new Promise((resolve, reject) => {
        upload(req, res, async (err) => {
            if (err) {
                reject(err)
            } else {
                let { file, body } = req;
                if (file) {
                    await uploadImage(`${body.patientId.trim()}/${body.visitId.trim()}/${file.originalname}`, file.path)
                    resolve({ file: `${body.patientId.trim()}/${body.visitId.trim()}/${file.originalname}`, path: file.path,  body });
                }
            }
        })
    })
}