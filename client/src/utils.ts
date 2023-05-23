export function groupByN(items: string[], n = 3): string[][] {
  if (!Array.isArray(items)) return []

  let k = -1
  const result = items.reduce((acc: string[][], item, index) => {
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