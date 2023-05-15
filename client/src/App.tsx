import { useEffect, useState } from 'react';
import './App.css';
import Frame from './Frame';

import textImage from './assets/text.jpg'

function groupByN(items: any[], n = 3) {
  if (!Array.isArray(items)) return []

  let k = -1
  const result = items.reduce((acc, item, index) => {
    if (index % n === 0) {
      k++
    }

    if (!acc[k]) {
      acc[k] = []
    }

    acc[k].push(item)

    return acc
  }, [])

  return result
}

function App() {
  const [images, setImages] = useState([])

  console.log('new render', 'we have', images.length, 'images')

  const searchParams = new URLSearchParams(document.location.search)

  const isAuth = searchParams.get('auth')

  useEffect(() => {
    if (!isAuth) return

    let timerId = setTimeout(function syncImages() {
      console.log('syncImages')

      fetch('/sync-images')
        .then((response) => {
          // console.log('sync response', response)

          if (response.status === 401) {
            window.location.href = '/'
          } else {
            timerId = setTimeout(syncImages, 5000)
          }
        })

    }, 5000)

    return () => {
      clearTimeout(timerId)
    }
  }, [isAuth])

  useEffect(() => {
    if (!isAuth) return

    let timerId = setTimeout(function getImages() {
      fetch('/get-images').then((result) => {
        return result.json()
      }).then((result) => {
        setImages(result)
        timerId = setTimeout(getImages, 5000)
      })
    }, 5000)

    return () => {
      clearTimeout(timerId)
    }
  }, [isAuth])

  if (isAuth && images.length === 0) {
    return <div className="App">Loading...</div>
  }

  if (images.length === 0) {
    return <div className="App"><a href="/login">Login</a></div>
  }

  const groupedImages = groupByN(images, 2)

  return (
    <div className="App">
      <div className="images">
        
          {groupedImages.length > 0 && groupedImages.map((imageSet: any, index: number) => {
            if (imageSet.length < 2) return null
            // return <div className="image" key={index}><img src={image} /></div>
            return <div key={index} className="frameSet"><Frame frameItems={imageSet} /></div>
          })}
        
      </div>
      <div className="text">
        <img src={textImage} alt="" />
      </div>
    </div>
  );
}

export default App
