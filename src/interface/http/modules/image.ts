import { ImageEntity } from './../../../entity/ImageEntity';
import { Router } from 'express';
import { getConnection } from 'typeorm';
import { azureBlob } from '../../../infra/Multer';

export = () => {
    const router = Router()

    router.get('/', async (req, res) => {
        let allImage = await getConnection().getRepository(ImageEntity).find();
        res.status(200).json({ data: allImage })
    })

    router.post('/', async (req, res) => {
        let storeImage: any = await azureBlob(req, res, 'false', false);
        if (storeImage && storeImage.body && storeImage.file) {
            let { visitId, patientId, creatorId } = storeImage.body;
            let data = {
                visit_id: visitId,
                patient_id: patientId,
                image_path: storeImage.file.destination,
                created_by: creatorId,
            }
            await getConnection().getRepository(ImageEntity).save(data);
            res.status(200).json({ message: 'Created' })
        } else {
            res.status(400).json({ message: 'Something failed', error: storeImage })
        }
    })

    router.put('/:id', async (req, res) => {
        let { ...arg } = req.body;
        let id = req.params.id;
        if (id) {
            try {
                await getConnection().getRepository(ImageEntity).update({ id: req.params.id }, arg);
                res.status(200).json({ message: 'Updated' })
            } catch (err) {
                res.status(400).json({ err })
            }
        } else {
            res.status(400).json({ message: 'id is required' })
        }
    })

    router.delete('/:id', async (req, res) => {
        let id = req.params.id;
        if (id) {
            try {
                await getConnection().getRepository(ImageEntity).delete(id);
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