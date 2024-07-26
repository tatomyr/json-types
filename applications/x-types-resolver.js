const {isObject, mergeAll} = require('./x-types-utils')

const resolveAndMerge = (xType, ctx) => {
  // Handle null types
  if (xType === null) {
    return null
  }

  // Handle $refs
  if (xType.$ref) {
    const resolved = ctx.resolve(xType).node
    if (resolved === undefined) {
      console.error('ERROR! Cannot resolve $ref:')
      console.error(xType.$ref)
      return 'any'
    }
    return resolveAndMerge(resolved, ctx)
  }

  // Handle AND types
  if (xType.$and) {
    if (!Array.isArray(xType.$and)) {
      console.error('ERROR! Expected an array but got:')
      console.error(xType.$and)
      return 'undefined'
    }
    return mergeAll(...xType.$and.map(item => resolveAndMerge(item, ctx)))
  }

  // Handle OR types
  if (Array.isArray(xType)) {
    if (xType.length === 0) {
      return 'undefined'
    }
    if (xType.length === 1) {
      return resolveAndMerge(xType[0], ctx)
    }
    return xType.map(type => resolveAndMerge(type, ctx)).flat()
  }

  // Handle object types
  if (isObject(xType)) {
    let obj = {}
    for (const key in xType) {
      obj[key] = resolveAndMerge(xType[key], ctx)
    }
    return obj
  }

  return xType
}

module.exports = {
  resolveAndMerge,
}
