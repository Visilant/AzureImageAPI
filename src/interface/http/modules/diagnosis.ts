import { DiagnosisEntity } from './../../../entity/DiagnosisEntity';
import { Router } from "express";
import { getConnection } from 'typeorm';

export = () => {
    const router = Router();

    router.get('/', async (req, res) => {
        try {
            let allImage = await getConnection().getRepository(DiagnosisEntity).find();
            res.status(200).json({ data: allImage })
        } catch (err) {
            res.status(400).json({ message: 'Something failed', error: err })
        }
    })

    router.post('/', async (req, res) => {
        if (req.body) {
            try {
                await getConnection().getRepository(DiagnosisEntity).save({...req.body});
                res.status(200).json({ message: 'Created' })
            } catch (err) {
                res.status(400).json({ message: 'Failed', error: err })
            }
        } else {
            res.status(400).json({ message: 'Something failed', error: 'Parameter is missing' })
        }
    })

    router.put('/:id', async (req, res) => {
        let { ...arg } = req.body;
        let id = req.params.id;
        if (id) {
            try {
                await getConnection().getRepository(DiagnosisEntity).update({ id }, arg);
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
                await getConnection().getRepository(DiagnosisEntity).delete(id);
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