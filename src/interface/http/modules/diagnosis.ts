import { DiagnosisEntity } from './../../../entity/DiagnosisEntity';
import { Router } from "express";
import auth from '../middleware/auth';
import { CustomQuery } from '../../../infra/customQuery';

export = () => {
    const router = Router();

    router.get('/', async (req, res) => {
        try {
            let query = CustomQuery(req.query);
            let allDiagnosis = await DiagnosisEntity.findAndCount(query).then(([rows, total]: [rows: DiagnosisEntity[], total: number]) => { return { datas: rows, total } });
            res.status(200).json({ data: allDiagnosis })
        } catch (err) {
            res.status(400).json({ message: 'Something failed', error: err })
        }
    })

    router.post('/', async (req, res) => {
        if (req.body) {
            try {
                let diagnosis = await DiagnosisEntity.save({ ...req.body });
                res.status(200).json({ message: 'Created', diagnosis })
            } catch (err) {
                res.status(400).json({ message: 'Failed', error: err })
            }
        } else {
            res.status(400).json({ message: 'Something failed', error: 'Parameter is missing' })
        }
    })

    router.use(auth().authenticate());

    router.put('/:id', async (req, res) => {
        let { ...arg } = req.body;
        let id = req.params.id;
        if (id) {
            try {
                await DiagnosisEntity.update({ id }, arg);
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
                await DiagnosisEntity.delete(id);
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