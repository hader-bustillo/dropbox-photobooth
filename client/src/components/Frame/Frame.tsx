import './Frame.css'

const Frame = ({ frameItems = [] }) => {
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