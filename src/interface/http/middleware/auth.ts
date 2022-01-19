import { UserEntity } from '../../../entity/UserEntity';
import passport from 'passport';
import { ExtractJwt, Strategy } from 'passport-jwt'
import config from '../../../../config';

export = () => {

  const params = {
    secretOrKey: config.authSecret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
  }

  const strategy = new Strategy(params, (payload, done) => {
    let where: any = { id: payload.id };
    return UserEntity.findOne(where)
      .then((user: any) => {
        if (!user.deleted_at) {
          return done(null, user)
        } else {
          return done(null, false)
        }
      })
      .catch((error: string) => done(error, null))
  })

  passport.use(strategy)

  passport.serializeUser((user, done) => {
    return done(null, user)
  })

  passport.deserializeUser((user: Object, done) => {
    done(null, user)
  })

  return {
    initialize: () => {
      return passport.initialize()
    },
    authenticate: () => {
      return passport.authenticate('jwt')
    }
  }
}
