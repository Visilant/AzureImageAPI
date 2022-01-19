import jwt from 'jsonwebtoken';
import { compose, trim, replace, partialRight } from 'ramda';
import config from '../../../config';

export = () => ({
    signin: (options: Object) => (payload: Object) => {
        const opt = Object.assign({}, options, { expiresIn: '1h' })
        return jwt.sign(payload, config.authSecret, opt)
    },
    verify: (options: Object) => (token: string) => {
        const opt = Object.assign({}, options)
        return jwt.verify(token, config.authSecret, opt)
    },
    decode: (options: Object) => (token: string) => {
        const opt = Object.assign({}, options)
        let toen: any = jwt.decode;
        const decodeToken = compose(
            partialRight(toen, [opt]),
            trim,
            replace(/Bearer|bearer/g, '')
        )
        return decodeToken(token)
    }
})
