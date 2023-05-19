export function groupByN(items: any[], n = 3) {
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