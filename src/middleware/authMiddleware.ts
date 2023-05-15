import { Request, Response, NextFunction } from 'express'
// import store from '../store'

const authMiddleware = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // console.log('getClientId', store.dbxAuth.getClientId())
    // console.log('old access token', store.dbxAuth.getAccessToken())

    // await store.dbxAuth.checkAndRefreshAccessToken()
    // // await store.dbxAuth.refreshAccessToken()

    // console.log('new access token', store.dbxAuth.getAccessToken())

    next()
  } catch (err) {
    // console.log('middleware error', err)
    // return res.status(401)
    //   .json({ 'message': err })
  }
}

export {
  authMiddleware
}
