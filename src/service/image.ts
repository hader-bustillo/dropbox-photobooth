import { Request, Response } from 'express'
import fs from 'fs'
import fsPromises from "node:fs/promises"
import path from 'path'
import store from '../store'

const dch = require('../utils/dropbox-content-hasher');

async function syncImagesService() {
  try {
    await readLocalImagesService()

    // console.log('store.files', store.files)

    const fileNames = {}
    for (let { hash, path } of store.files) {
      fileNames[path] = hash
    }

    // console.log('fileNames', fileNames)

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
      if (fileNames['/images/upl_' + file.name] && fileNames['/images/upl_' + file.name] === file.content_hash) {
        console.log(`File: ${file.name} exists.`)
        continue
      }

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
              console.log(`File: ${data.result.name} downloaded.`)
            }
          )
        } else {
          
        }
      })
    }

    await readLocalImagesService()

    // if there are more local items than remote let's do cleanup
    if (store.files.length > files.length) {
      removeStaleImages(files)
    }
  } catch(err) {
    console.log('syncImages error!')
    console.log(err)

    throw new Error('syncImagesService error')
  }

}

function removeStaleImages (files) {
  const fileNames = {}
  for (let { hash, path } of store.files) {
    fileNames[path] = hash
  }

  for (let file of files) {
    //'/images/upl_1683233127.jpg'
    delete fileNames['/images/upl_' + file.name]
  }

  // console.log('this files need to be deleted', fileNames)
  removeFiles(fileNames)
}

async function readLocalImagesService() {
  store.files = []

  const dir = './images/'

  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir)
  }

  const files = await fsPromises.readdir(dir)

  const filesCount = files.length
  let i = 0

  return new Promise(async (resolve, reject) => {
    files.forEach(file => {
      const imagePath = '/images/' + file
  
      const hasher = dch.create()
      
      const f = fs.createReadStream('.' + imagePath)
      f.on('data', function(buf) {
        hasher.update(buf)
      })
  
      f.on('end', function(err) {
        const hexDigest = hasher.digest('hex')
        // console.log('hexDigest', hexDigest)

        store.files.push({
          path: imagePath,
          hash: hexDigest
        })

        i++
        if (i === filesCount) {
          resolve('success')
        }
      })

      f.on('error', function(err) {
        // console.error("Error reading from file: " + err)
        reject("Error reading from file: " + err)
      });
    })
  })
}

async function removeFiles(files) {
  try {
    for (let file in files) {
      console.log('remove file', file)
      await fsPromises.unlink('.' + file)
    }
  } catch {
    console.error('File delete error')
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
  }
}

export {
  syncImagesService,
  resetImagesService,
}