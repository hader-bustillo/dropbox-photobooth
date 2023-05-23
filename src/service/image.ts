import { Request, Response } from 'express'
import fs from 'fs'
import fsPromises from "node:fs/promises"
import path from 'path'
import store from '../store'

async function syncImagesService() {
  try {
    const response: any = await store.dbx.filesListFolder({ 
      path: '', 
      shared_link: {
        url: process.env.DROPBOX_SHARED_LINK
      }
    })

    // update accessToken in storage
    const accessToken = store.dbx.auth.getAccessToken()
    if (accessToken !== store.accessToken) {
      store.accessToken = accessToken
    }

    const files = response.result.entries

    for (let file of files) {
      const data = await store.dbx.filesDownload({ path: file.id })

      const imagePath = path.join('images', data.result.name)

      fs.access(imagePath, function (error) {
        if (error) {
          fs.writeFile(
            path.join('images', 'upl_' + data.result.name), 
            (<any> data).result.fileBinary, 
            { encoding: 'binary' },
            (err) => {
              if (err) { 
                // console.log(`File: ${data.result.name} exists.`)
              }
              // console.log(`File: ${data.result.name} saved.`)
            }
          )
        } else {
          console.log(`File: ${data.result.name} exists.`)
        }
      })
    }
  } catch(err) {
    console.log('syncImages error!')
    console.log(err)

    throw new Error('syncImagesService error')
  }

}

async function resetImagesService (_req: Request, res: Response) {
  store.accessToken = null
  store.refreshToken = null

  const directory = "images"

  try {
    await fsPromises.access(directory);
    
    for (const file of await fsPromises.readdir(directory)) {
      await fsPromises.unlink(path.join(directory, file))
    }
  } catch {
    console.error('Folder does not exist')
  } finally {
    return res.redirect('/')
  }
}

export {
  syncImagesService,
  resetImagesService
}