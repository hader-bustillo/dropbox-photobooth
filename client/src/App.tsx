import { useEffect, useState } from 'react';
import CarouselBlock from './components/CarouselBlock/CarouselBlock';

import textImage from './assets/text.jpg'
import { AuthStatus } from './types';
import './App.css';

function App() {
  const [images, setImages] = useState([])
  const [isAuth, setIsAuth] = useState(AuthStatus.PENDING)

  console.log('new render', 'we have', images.length, 'images')

  useEffect(() => {
    fetch('/is-authorized')
      .then((result) => {
        return result.json()
      })
      .then((response) => {
        // console.log('auth response', response)
        if (response.status === true) {
          setIsAuth(AuthStatus.AUTHORIZED)
        } else {
          setIsAuth(AuthStatus.NOT_AUTHORIZED)
        }
      })
  }, [])

  useEffect(() => {
    if (isAuth !== AuthStatus.AUTHORIZED) return

    let timerId = setTimeout(function syncImages() {
      console.log('syncImages')

      fetch('/sync-images')
        .then((response) => {
          // console.log('sync response', response)

          if (response.status === 401) {
            window.location.href = '/'
          } else {
            timerId = setTimeout(syncImages, 15000)
          }
        })

    }, 0)

    return () => {
      clearTimeout(timerId)
    }
  }, [isAuth])

  useEffect(() => {
    if (isAuth !== AuthStatus.AUTHORIZED) return

    let timerId = setTimeout(function getImages() {
      fetch('/get-images').then((result) => {
        return result.json()
      }).then((result) => {
        setImages(result)
        timerId = setTimeout(getImages, 20000)
      })
    }, 0)

    return () => {
      clearTimeout(timerId)
    }
  }, [isAuth])


  if (isAuth === AuthStatus.PENDING && images.length === 0) {
    return <div className="App">Loading...</div>
  }

  if (isAuth === AuthStatus.NOT_AUTHORIZED) {
    return (
        <div className="App">
          <a href="/login">Login</a>
        </div>
      )
  }

  return (
    <div className="App">
      <div className="images">
      {images.length > 0 && <CarouselBlock images={images} />}
      </div>
      <div className="text">
        <img src={textImage} alt="" />
      </div>
    </div>
  );
}

export default App
