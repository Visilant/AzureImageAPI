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
const upload_multiple = multer({ storage: storage }).array('file', 100);

export const azureBlob = async (req: Request, res: Response) => {
    return new Promise((resolve, reject) => {
        upload(req, res, async (err) => {
            if (err) {
                reject(err)
            } else {
                let { file, body } = req;
                if (file) {
                    await uploadImage(`${body.patientId.trim()}/${body.visitId.trim()}/${file.originalname}`, file.path)
                    resolve({ file: `${body.patientId.trim()}/${body.visitId.trim()}/${file.originalname}`, path: file.path, body, fileName: file.originalname });
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
                let response: any = [];
                let { visitId = [], patientId = [], creatorId = [], visual_acuity = [], pinhole_acuity = [], type = [], age = [], sex = [], complaints = [], fam_history = [], pat_history = [], efficient = [] } = req.body;
                if (files.length) {
                    files.forEach(async (file: any, index: number) => {
                        response.push({
                            visit_id: visitId[index].trim(),
                            patient_id: patientId[index].trim(),
                            image_path: `https://${process.env.AZURE_CONTAINER}.blob.core.windows.net/${process.env.CONTAINER_NAME}/${patientId[index].trim()}/${visitId[index].trim()}/${file.originalname}`,
                            created_by: creatorId[index].trim(),
                            visual_acuity: visual_acuity[index] ? visual_acuity[index] : '',
                            pinhole_acuity: pinhole_acuity[index] ? pinhole_acuity[index] : '',
                            type: type[index] ? type[index] : '',
                            age: age[index] ? age[index] : '',
                            sex: sex[index] ? sex[index] : '',
                            complaints: complaints[index] ? complaints[index] : '',
                            pat_history: pat_history[index] ? pat_history[index] : '',
                            fam_history: fam_history[index] ? fam_history[index] : '',
                            efficient: efficient[index] ? efficient[index] : '',
                            image_name: file.originalname
                        })
                        await uploadImage(`${patientId[index].trim()}/${visitId[index].trim()}/${file.originalname}`, file.path);
                        fs.unlinkSync(file.path);
                    })
                    resolve(response);
                }
            }
        })
    })
}