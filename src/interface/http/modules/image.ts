import { ImageEntity } from './../../../entity/ImageEntity';
import { Router } from 'express';
import { azureBlob, azureBlobMultiple } from '../../../infra/Multer';
import fs from 'fs';
import auth from '../middleware/auth';
import { CustomQuery } from '../../../infra/customQuery';

export = () => {
    const router = Router();

    router.get('/', async (req, res) => {
        try {
            let query = CustomQuery(req.query);
            let allImage = await ImageEntity.findAndCount(query).then(([rows, total]: [rows: ImageEntity[], total: number]) => { return { datas: rows, total } });
            res.status(200).json({ data: allImage })
        } catch (err) {
            res.status(400).json({ message: 'Something failed', error: err })
        }
    })

    router.get('/:patientId/:visitID', async (req, res) => {
        let { patientId, visitID } = req.params;
        try {
            let allImage = await ImageEntity.find({ where: { patient_id: patientId, visit_id: visitID } });
            res.status(200).json({ data: allImage })
        } catch (err) {
            res.status(400).json({ message: 'Something failed', error: err })
        }
    })

    router.post('/', async (req, res) => {
        let storeImage: any = await azureBlob(req, res);
        if (storeImage && storeImage.body && storeImage.file) {
            let { visitId, patientId, creatorId } = storeImage.body;
            let data = {
                ...storeImage.body,
                visit_id: visitId.trim(),
                patient_id: patientId.trim(),
                image_path: `https://${process.env.AZURE_CONTAINER}.blob.core.windows.net/${process.env.CONTAINER_NAME}/${storeImage.file}`,
                created_by: creatorId.trim(),
                image_name: storeImage.fileName
            }
            try {
                let imageExists = await ImageEntity.find({ where: { image_name: data.image_name } })
                if (imageExists.length) {
                    res.status(200).json({ message: 'Image Exist Already', imageExists })
                } else {
                    let image = await ImageEntity.save(data);
                    res.status(200).json({ message: 'Created', image })
                }
                fs.unlinkSync(storeImage.path);
            } catch (err) {
                res.status(400).json({ message: 'Failed', error: err })
            }
        } else {
            res.status(400).json({ message: 'Something failed', error: storeImage })
        }
    })

    /**
     * Upload maximum 100 photos at one call
     */
    router.post('/multiple', async (req, res) => {
        let storeImage: any = await azureBlobMultiple(req, res);
        if (storeImage.length) {
            try {
                let images: any = [];
                storeImage.forEach(async (image: any, index: number) => {
                    let imageExists = await ImageEntity.find({ where: { image_name: image.image_name } })
                    if (!imageExists.length) {
                        await ImageEntity.save(image);
                        images.push(image);
                    }
                    if (index + 1 === storeImage.length) {
                        res.status(200).json({ message: 'Created', images })
                    }
                })
            } catch (err) {
                res.status(400).json({ message: 'Failed', error: err })
            }
        } else {
            res.status(400).json({ message: 'Something failed', error: storeImage })
        }
    })

    router.put('/:id', async (req, res) => {
        let { ...arg } = req.body;
        let id = req.params.id;
        if (id) {
            try {
                await ImageEntity.update({ id }, arg);
                res.status(200).json({ message: 'Updated' })
            } catch (err) {
                res.status(400).json({ err })
            }
        } else {
            res.status(400).json({ message: 'id is required' })
        }
    })

    router.use(auth().authenticate());

    router.delete('/:id', async (req, res) => {
        let id = req.params.id;
        if (id) {
            try {
                await ImageEntity.delete(id);
                res.status(200).json({ message: 'Deleted' })
            } catch (err) {
                res.status(400).json(err)
            }
        } else {
            res.status(400).json({ message: 'id is required' })
        }
    })

    return router;
}