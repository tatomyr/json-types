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

const deepMerge2 = (one, two) => {
  // TODO: handle references to another x-types

  if (typeof one === "string" || typeof two === "string") {
    throw new Error(`Merging primitives is not allowed: "${one}" & "${two}"`)
  }

  if (typeof one.array !== "undefined" || typeof two.array !== "undefined") {
    throw new Error(`Cannot merge "array" type`)
  }

  if (typeof one.$and !== "undefined") {
    return merge(...one.$and, two)
  }

  if (typeof two.$and !== "undefined") {
    return merge(...two.$and, one)
  }

  if (one instanceof Array && isObject(two)) {
    return one.map(item => deepMerge2(item, two))
  }

  if (isObject(one) && two instanceof Array) {
    return two.map(item => deepMerge2(item, one))
  }

  if (one instanceof Array && two instanceof Array) {
    return product(one, two).map(([a, b]) => deepMerge2(a, b))
  }

  if (isObject(one) && isObject(two)) {
    const result = structuredClone(one)

    for (const key in two) {
      if (typeof result[key] === "undefined") {
        result[key] = two[key]
      } else {
        result[key] = deepMerge2(result[key], two[key])
      }
    }

    return result
  }
}

const merge = (...args) => {
  return args.reduce((acc, item) => {
    return deepMerge2(acc, item)
  }, {})
}

module.exports = {
  isObject,
  merge,
}
