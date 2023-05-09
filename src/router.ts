import express, { Request, Response } from 'express'
import * as dotenv from 'dotenv'
import store from './store'
import fs from 'fs'

import { authMiddleware } from './middleware/authMiddleware'

import { DropboxAuth } from 'dropbox'
import { resetImagesService, syncImagesService } from './service/image'

dotenv.config()

const router = express.Router()

const dbxAuth = new DropboxAuth({
  clientId: process.env.DROPBOX_CLIENT_ID,
  clientSecret: process.env.DROPBOX_CLIENT_SECRET,
})

router.get('/login', async (_req: Request, res: Response) => {
  try {
    const authUrl = await dbxAuth.getAuthenticationUrl(process.env.DROPBOX_REDIRECT_URI, null, 'code', 'offline', null, 'none', false)
    console.log('authUrl', authUrl) 

    res.writeHead(302, { Location: authUrl.toString() })
    res.end()
  } catch(err) {
    console.log(err)
  }

  // old implementation:
  // dbx.auth.getAuthenticationUrl(redirectUri, null, 'code', 'offline', null, 'none', true)
  // const authUrl = dropbox.generateAuthUrl()
  // console.log('authUrl', authUrl)
})

router.get('/refresh-token', (req, res) => {
  // TODO: Make refresh token
  // dropbox.refreshToken(store.refreshToken, (err: any, result: { access_token: string }) => {
  //   store.accessToken = result.access_token
  //   console.log('refresh token result', result)

  // })
})

router.get('/auth',  async (req, res) => {
  console.log('/auth')

  const { code }: { code?: any} = req.query

  console.log('code', code)
  console.log('process.env.DROPBOX_REDIRECT_URI', process.env.DROPBOX_REDIRECT_URI)

  try {
    const response: any = await dbxAuth.getAccessTokenFromCode(process.env.DROPBOX_REDIRECT_URI, code)
    console.log('result', response)
  
    store.accessToken = response.result.access_token
    store.refreshToken = response.result.refresh_token

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

router.get('/get-tokens', (_req: Request, res: Response) => {
  return res.send(
    'Access token is ' + store.accessToken + 
    '. Refresh token is ' + store.refreshToken
  )
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
      results.push(file)
    })

    res.json(results)
  } catch (err) {
    console.log('getImages error', err)
  }
}

router.get('/get-images', getImages)

async function syncImages (_req: Request, res: Response) {
  await syncImagesService()
  return res.json({ "message": "done" })
}

router.get('/sync-images', authMiddleware, syncImages)

export default router