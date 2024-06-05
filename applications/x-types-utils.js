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

const deepMergeTwo = (first, second) => {
  // TODO: handle references to another x-types

  if (typeof first === "string" || typeof second === "string") {
    console.error()
    console.error(
      `ERROR! Merging primitives is not allowed: "${first}" & "${second}".`
    )
    console.error()
    return "undefined"
  }

  if (
    typeof first.array !== "undefined" ||
    typeof second.array !== "undefined"
  ) {
    throw new Error(`Cannot mergeAll "array" type`)
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
}

const mergeAll = (...args) => {
  return args.reduce((acc, item) => {
    return deepMergeTwo(acc, item)
  })
}

module.exports = {
  isObject,
  mergeAll,
}
