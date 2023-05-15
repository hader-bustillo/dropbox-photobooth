const Frame = ({ frameItems = [] }) => {
  // const firstSet: string[] = []
  // const secondSet: string[] = []

  // frameItems.forEach((item, index) => {
  //   if (index < 1) {
  //     firstSet.push(item)
  //   } else {
  //     secondSet.push(item)
  //   }
  // })

  return (
    <>
      {frameItems.map((frame, index) => {
        return (
          <div key={index} className="frame">
            <img src={frame} />
          </div>
        )
      })}
      {/* <div className="frame">
        {firstSet.length > 0 && firstSet.map((item, index) => {
          return (
            <div className="frame__item" key={index}>
              <img src={item} />
            </div>
          )
        })}
      </div>
      <div className="frame">
        {secondSet.map((item, index) => {
          return (
            <div className="frame__item" key={index}>
              <img src={item} />
            </div>
          )
        })}
      </div> */}
    </>
  )
}

export default Frame