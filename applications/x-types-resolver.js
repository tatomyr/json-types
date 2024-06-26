const {isObject, mergeAll} = require('./x-types-utils')

const resolveAndMerge = (xType, ctx) => {
  if (xType.$ref) {
    const resolved = ctx.resolve(xType).node
    if (resolved === undefined) {
      console.error('ERROR! Cannot resolve $ref:')
      console.error(xType.$ref)
      return 'any'
    }
    return resolveAndMerge(resolved, ctx)
  }

  if (xType.$and) {
    if (!Array.isArray(xType.$and)) {
      console.error('ERROR! Expected an array but got:')
      console.error(xType.$and)
      return 'undefined'
    }
    return mergeAll(...xType.$and.map(item => resolveAndMerge(item, ctx)))
  }

  if (Array.isArray(xType)) {
    return xType.map(type => resolveAndMerge(type, ctx)).flat()
  }

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
