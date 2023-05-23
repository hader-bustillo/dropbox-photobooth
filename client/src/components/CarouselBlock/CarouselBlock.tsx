import { FC } from 'react'
import Carousel from 'react-multi-carousel'
import 'react-multi-carousel/lib/styles.css'

import { groupByN } from '../../utils'
import Frame from '../Frame/Frame'

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1 },
    items: 6,
  },
}

type CarouselBlockType = {
  images: string[]
}

const CarouselBlock: FC<CarouselBlockType> = ({ images }) => {
  const groupedImages = groupByN(images, 2)

  return (
    <div style={{ width: '100%' }}>
      <Carousel
        infinite
        autoPlay
        arrows={false}
        autoPlaySpeed={3000}
        containerClass="container-with-dots"
        slidesToSlide={1}
        responsive={responsive}
        customTransition="transform 700ms ease-in-out"
        transitionDuration={700}
      >
        {groupedImages.map((imageSet, index: number) => {
          if (imageSet.length < 2) return null

          return <div key={index} className="frameSet"><Frame frameItems={imageSet} /></div>
        })}
      </Carousel>
    </div>
  )
}

export default CarouselBlock