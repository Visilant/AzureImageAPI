import { UserEntity } from './../../../entity/UserEntity';
import { Router } from "express";
import bcrypt from 'bcrypt';
import jwt from '../../../infra/jwt';
import auth from '../middleware/auth';
const saltRounds = 10;

export = () => {
    const router = Router();

    router.post('/signin', async (req, res) => {
        try {
            const where = Object.assign({}, req.body);
            if (where.password) {
                delete where.password
            }
            let user: any = await UserEntity.findOne(where);
            if (user) {
                let passwordValidate = bcrypt.compareSync(req.body.password, user.password);
                if (passwordValidate) {
                    delete user.password;
                    if (!user.deleted_at) {
                        res.status(200).json({
                            token: jwt().signin({})({
                                id: user.id,
                                email: user.email
                            }),
                            user: user
                        });
                    }
                } else res.status(200).json({ message: 'Invalid Password' })
            } else res.status(200).json({ message: 'Invalid Email' })
        } catch (err) {
            res.status(400).json({ message: 'Something failed', error: err })
        }
    })

    router.use(auth().authenticate());
    
    router.get('/', async (req, res) => {
        try {
            let allUsers = await UserEntity.find();
            res.status(200).json({ data: allUsers })
        } catch (err) {
            res.status(400).json({ message: 'Something failed', error: err })
        }
    })

    router.post('/', async (req, res) => {
        if (req.body) {
            try {
                if (req.body.password) {
                    const salt = bcrypt.genSaltSync(saltRounds);
                    const hash = bcrypt.hashSync(req.body.password, salt);
                    req.body.password = hash;
                }
                let user = await UserEntity.save({...req.body});
                res.status(200).json({ message: 'Created', user })
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
                await UserEntity.update({ id }, arg);
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
                await UserEntity.delete(id);
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