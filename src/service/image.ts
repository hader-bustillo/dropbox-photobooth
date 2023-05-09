import { Request, Response } from 'express'
import fs from 'fs'
import fsPromises from "node:fs/promises"
import path from 'path'
import { Dropbox } from 'dropbox'
import store from '../store'

async function syncImagesService() {
  try {
    const dbx = new Dropbox({ accessToken: store.accessToken })

    const response: any = await dbx.filesListFolder({ path: '/images' })

    const files = response.result.entries

    for (let file of files) {
      const data = await dbx.filesDownload({ path: file.id })

      const imagePath = path.join('images', data.result.name)

      fs.access(imagePath, function (error) {
        if (error) {
          fs.writeFile(
            path.join('images', data.result.name), 
            (<any> data).result.fileBinary, 
            { encoding: 'binary' },
            (err) => {
              if (err) { 
                // console.log(`File: ${data.result.name} exists.`)
              }
              console.log(`File: ${data.result.name} saved.`)
            }
          )
        } else {
          console.log(`File: ${data.result.name} exists.`)
        }
      })
    }
  } catch(err) {
    console.log(err)
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