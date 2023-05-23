import { FC } from 'react'
import './Frame.css'

type FrameType = {
  frameItems: string[]
}

const Frame: FC<FrameType> = ({ frameItems = [] }) => {
  return (
    <>
      {frameItems.map((frame, index) => {
        return (
          <div key={index} className="frame">
            <img src={frame} />
          </div>
        )
      })}
    </>
  )
}

export default Frame