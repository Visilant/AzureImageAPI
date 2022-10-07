import { uploadImage } from './../Azure/index';
import { Response, Request } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `${__dirname}/../../../upload`)
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
})

const upload = multer({ storage: storage }).single('file');
const upload_multiple = multer({storage: storage}).array('file', 100);

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

export const azureBlobMultiple = async (req: Request, res: Response) => {
    return new Promise((resolve, reject) => {
        upload_multiple(req, res, async (err) => {
            if (err) {
                reject(err)
            } else {
                let files: any = req.files;
                let body: any = req.body;
                let response: any = [];
                if (files.length) {
                    files.forEach(async (file: any) => {
                        response.push({
                            ...body,
                            visit_id: body.visitId.trim(),
                            patient_id: body.patientId.trim(),
                            image_path: `https://${process.env.AZURE_CONTAINER}.blob.core.windows.net/${process.env.CONTAINER_NAME}/${body.patientId.trim()}/${body.visitId.trim()}/${file.originalname}`,
                            created_by: body.creatorId.trim()
                        })
                        await uploadImage(`${body.patientId.trim()}/${body.visitId.trim()}/${file.originalname}`, file.path);
                        fs.unlinkSync(file.path);
                    })
                    resolve(response);
                }
            }
        })
    })
}