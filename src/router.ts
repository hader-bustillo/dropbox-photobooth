import express, { Request, Response } from 'express'
import * as dotenv from 'dotenv'
import store from './store'
import fs from 'fs'

import { Dropbox } from 'dropbox'
import { resetImagesService, syncImagesService } from './service/image'

dotenv.config()

const router = express.Router()

store.dbx = new Dropbox({ 
  clientId: process.env.DROPBOX_CLIENT_ID, 
  clientSecret: process.env.DROPBOX_CLIENT_SECRET,
})

router.get('/login', async (_req: Request, res: Response) => {
  try {
    const authUrl = await store.dbx.auth.getAuthenticationUrl(process.env.DROPBOX_REDIRECT_URI, null, 'code', 'offline', null, 'none', false)
    console.log('authUrl', authUrl) 

    res.writeHead(302, { Location: authUrl.toString() })
    return res.end()
  } catch(err) {
    console.log(err)
  }
})

router.get('/is-authorized', (_req: Request, res: Response) => {
  const authStatus = Boolean(store.accessToken)
  return res.json({ "status": authStatus })
})

router.get('/get-tokens', (_req: Request, res: Response) => {
  return res.send(
    'Access Token: ' + store.accessToken + '<br>' + 
    'Refresh Token: ' + store.refreshToken + '<br>' + 
    'Client Id: ' + store.clientId
  )
})

router.get('/auth',  async (req, res) => {
  console.log('/auth')

  const { code }: { code?: any} = req.query

  try {
    const response: any = await store.dbx.auth.getAccessTokenFromCode(process.env.DROPBOX_REDIRECT_URI, code)
    console.log('result', response)

    // console.log('get access token', )

    // console.log( 'getAccessTokenExpiresAt',  store.dbxAuth.getAccessTokenExpiresAt() )
    // console.log( 'getRefreshToken',  store.dbxAuth.getRefreshToken() )
  
    store.accessToken = response.result.access_token
    store.refreshToken = response.result.refresh_token

    // store.dbxAuth.setAccessToken(store.accessToken)
    // store.dbxAuth.setRefreshToken(store.refreshToken)

    // await store.dbxAuth.checkAndRefreshAccessToken()

    const date = new Date()
    date.setMilliseconds(date.getMilliseconds() + response.result.expires_in * 1000)

    store.dbx.auth.setAccessToken(store.accessToken)
    store.dbx.auth.setRefreshToken(store.refreshToken)
    store.dbx.auth.setAccessTokenExpiresAt(date)
    
    // store.accessToken = 'asl.BeiyixlWwDWvRQlOUkVijAjSD4si1Z9GefqgXtYmzlr14l1XmlI6V2nWeu2NwYMeIWz-szesX0HBQt5Z-Ku_fYsaLPzAa_MOpuDZCqz6vMq_OrhYJ3i69CiNmfxnZfMiTIUq70w'
    // store.refreshToken = 'MDACer0cpcsAAAAAAAAAASbSyYOMlaUHxjMKKXF6Zruo5kCCUiraNZOJMscKd2uO'
    // store.clientId = process.env.DROPBOX_CLIENT_ID

    // const date = new Date()
    // date.setMinutes(date.getMinutes() + 5)

    // store.dbx = new Dropbox({ 
    //   accessToken: store.accessToken, 
    //   refreshToken: store.refreshToken, 
    //   clientId: process.env.DROPBOX_CLIENT_ID, 
    //   clientSecret: process.env.DROPBOX_CLIENT_SECRET, 
    //   // accessTokenExpiresAt: date
    // })

    // store.dbx = new Dropbox({ auth: store.dbxAuth })

    // console.log('store.dbx', store.dbx)

    // return res.redirect('/get-tokens')
    return res.redirect('/')
  } catch (err) {
    console.log(err)
  }
})

router.get('/reset', resetImagesService)

router.get('/refresh', (_req: Request, res: Response) => {
  // 1. Get original access token
  console.log('old access token', store.dbx.auth.getAccessToken())

  // 2. Set date
  const date = new Date()
  store.dbx.auth.setAccessTokenExpiresAt(date)

  // 3. Refresh token
  setTimeout(async () => {
    await store.dbx.filesListFolder({ path: '', shared_link: {
      url: 'https://www.dropbox.com/scl/fo/oshpp9zz2aapat9swthdu/h?dl=0&rlkey=4xp62oh3zutox8029jvqgnia6'
    }})

    // 4. Get new access token
    store.accessToken = store.dbx.auth.getAccessToken()
    console.log('new access token', store.dbx.auth.getAccessToken())
  }, 1000)

  return res.json({ "message": "access token refreshed" })
})

router.get('/remove-access-token', (_req: Request, res: Response) => {
  // store.accessToken = null

  var oldDateObj = new Date()
  // accessTokenExpiresAt: new Date(oldDateObj.getTime() + 3*60000)

  // store.dbxAuth.set
  store.dbxAuth.setAccessTokenExpiresAt(new Date(oldDateObj.getTime() + 1*60000))
  const dateSet = store.dbxAuth.getAccessTokenExpiresAt()

  console.log('dateSet', dateSet)
  
  return res.json({ "message": "access token removed" })
})

function getImages (_req: Request, res: Response) {
  const results = []

  const dir = './images/'

  try {
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir)
    }

    const files = fs.readdirSync(dir)
  
    files.forEach(file => {
      const imagePath = '/images/' + file
      results.push(imagePath)
    })

    res.json(results)
  } catch (err) {
    console.log('getImages error', err)
  }
}

router.get('/get-images', getImages)

async function syncImages (_req: Request, res: Response) {
  try {
    console.log('syncImages controller')
    await syncImagesService()
    return res.json({ "message": "done" })
  } catch (err) {
    return res.status(401)
      .json({ 'message': err })
  }

}

router.get('/sync-images', syncImages)

export default router