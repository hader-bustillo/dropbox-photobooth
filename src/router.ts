import express, { Request, Response } from 'express'
import * as dotenv from 'dotenv'
import store from './store'
import fs from 'fs'

import { authMiddleware } from './middleware/authMiddleware'

import { DropboxAuth, Dropbox } from 'dropbox'
import { resetImagesService, syncImagesService } from './service/image'

dotenv.config()

const router = express.Router()

store.dbxAuth = new DropboxAuth({
  clientId: process.env.DROPBOX_CLIENT_ID,
  clientSecret: process.env.DROPBOX_CLIENT_SECRET,
})

router.get('/login', async (_req: Request, res: Response) => {
  try {
    const authUrl = await store.dbxAuth.getAuthenticationUrl(process.env.DROPBOX_REDIRECT_URI, null, 'code', 'offline', null, 'none', false)
    console.log('authUrl', authUrl) 

    res.writeHead(302, { Location: authUrl.toString() })
    return res.end()
  } catch(err) {
    console.log(err)
  }

  // old implementation:
  // dbx.auth.getAuthenticationUrl(redirectUri, null, 'code', 'offline', null, 'none', true)
  // const authUrl = dropbox.generateAuthUrl()
  // console.log('authUrl', authUrl)
})

router.get('/get-tokens', (_req: Request, res: Response) => {
  return res.send(
    'Access token is ' + store.accessToken + 
    '. Refresh token is ' + store.refreshToken
  )
})

router.get('/refresh-token', async (req, res) => {
  // console.log('store', store)
  console.log('accessToken from store', store.accessToken)

  const accessTokenFromDbx = await store.dbxAuth.getAccessToken()
  console.log('accessToken from dbxAuth', accessTokenFromDbx)

  console.log('refresh token action')

  await store.dbxAuth.refreshAccessToken()

  // dbxAuth.checkAndRefreshAccessToken()

  const newAccessTokenFromDbx = store.dbxAuth.getAccessToken()
  console.log('accessToken from dbxAuth', newAccessTokenFromDbx)

  store.accessToken = newAccessTokenFromDbx

  // TODO: Make refresh token
  // dropbox.refreshToken(store.refreshToken, (err: any, result: { access_token: string }) => {
  //   store.accessToken = result.access_token
  //   console.log('refresh token result', result)

  // })
  return res.send('seems to be ok')
})

router.get('/auth',  async (req, res) => {
  console.log('/auth')

  const { code }: { code?: any} = req.query

  // console.log('code', code)
  // console.log('process.env.DROPBOX_REDIRECT_URI', process.env.DROPBOX_REDIRECT_URI)

  try {
    const response: any = await store.dbxAuth.getAccessTokenFromCode(process.env.DROPBOX_REDIRECT_URI, code)
    console.log('result', response)

    // console.log('get access token', )

    // console.log( 'getAccessTokenExpiresAt',  store.dbxAuth.getAccessTokenExpiresAt() )
    // console.log( 'getRefreshToken',  store.dbxAuth.getRefreshToken() )
  
    store.accessToken = response.result.access_token
    store.refreshToken = response.result.refresh_token

    // store.dbxAuth.setAccessToken(store.accessToken)
    // store.dbxAuth.setRefreshToken(store.refreshToken)

    store.dbx = new Dropbox({ accessToken: store.accessToken, refreshToken: store.refreshToken })

    // return res.redirect('/get-tokens')
    return res.redirect('/?auth=1')
  } catch (err) {
    console.log(err)
  }


  // dropbox.getToken(code, (err: any, result: { access_token: string; refresh_token: string }, response: any) => {
    
    
  //   console.log('result', result)

  //   store.accessToken = result.access_token
  //   store.refreshToken = result.refresh_token
  //   // you are authorized now!
  //   //
  //   // ...then you can refresh your token! (flow for token_access_type='offline')
  //   // dropbox.refreshToken(response.refresh_token, (err, result, response) => {
  //   //     //token is refreshed!
  //   // });
  //   res.redirect('/?auth=1')
  // });
  
})

router.get('/reset', resetImagesService)

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