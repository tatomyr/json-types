const isObject = obj =>
  obj && typeof obj === "object" && !(obj instanceof Array)

const product = (a, b) => {
  const result = []

  for (const itemA of a) {
    for (const itemB of b) {
      result.push([itemA, itemB])
    }
  }

  return result
}

const isPrimitive = value => {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null ||
    value === undefined ||
    value === "undefined"
  )
}

const deepMergeTwo = (first, second) => {
  if (first === "any") {
    return second
  }
  if (second === "any") {
    return first
  }
  if (first === second) {
    return first
  }

  if (isPrimitive(first) || isPrimitive(second)) {
    console.error(
      `ERROR! Merging primitives is not allowed: '${first}' & '${second}'.`
    )
    return "undefined"
  }

  if (
    typeof first.array !== "undefined" ||
    typeof second.array !== "undefined"
  ) {
    console.error("ERROR! Cannot merge 'array' types.")
    return "undefined"
  }

  if (typeof first.$and !== "undefined") {
    return mergeAll(...first.$and, second)
  }
  if (typeof second.$and !== "undefined") {
    return mergeAll(...second.$and, first)
  }

  if (first instanceof Array && isObject(second)) {
    return first.map(item => deepMergeTwo(item, second))
  }
  if (isObject(first) && second instanceof Array) {
    return second.map(item => deepMergeTwo(item, first))
  }

  if (first instanceof Array && second instanceof Array) {
    return product(first, second).map(([a, b]) => deepMergeTwo(a, b))
  }

  if (isObject(first) && isObject(second)) {
    const result = structuredClone(first)

    for (const key in second) {
      if (typeof result[key] === "undefined") {
        result[key] = second[key]
      } else {
        result[key] = deepMergeTwo(result[key], second[key])
      }
    }

    return result
  }

  throw new Error(`Cannot merge ${first} & ${second}.`)
}

const mergeAll = (...args) => {
  if (args.length === 0) {
    console.error("ERROR! Cannot merge empty lists.")
    return "undefined"
  }
  return args.reduce((acc, item) => {
    return deepMergeTwo(acc, item)
  })
}

module.exports = {
  isObject,
  mergeAll,
}
