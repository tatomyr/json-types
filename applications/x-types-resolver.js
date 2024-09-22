const {isObject, mergeAll} = require('./x-types-utils')

const resolveAndMerge = (xType, ctx, refs = []) => {
  // Handle null types
  if (xType === null) {
    return null
  }

  // Handle $refs
  if (xType.$ref) {
    // TODO: find out how to track only NESTED circular $refs
    if (refs.filter(ref => ref === xType.$ref).length > 3) {
      console.error('ERROR! Circular reference detected:', xType.$ref)
      return 'any' // FIXME: return more nested type. Also, this falls here when there's a couple of the same $refs as siblings, which is wrong!
      // return xType
    } else {
      refs.push(xType.$ref)
    }
    const resolved = ctx.resolve(xType).node
    if (resolved === undefined) {
      console.error('ERROR! Cannot resolve $ref:')
      console.error(xType.$ref)
      return 'any'
    }
    return resolveAndMerge(resolved, ctx, refs)
  }

  // Handle AND types
  if (xType.$and) {
    if (!Array.isArray(xType.$and)) {
      console.error('ERROR! Expected an array but got:')
      console.error(xType.$and)
      return 'undefined'
    }
    return mergeAll(...xType.$and.map(item => resolveAndMerge(item, ctx, refs)))
  }

  // Handle OR types
  if (Array.isArray(xType)) {
    if (xType.length === 0) {
      return 'undefined'
    }
    if (xType.length === 1) {
      return resolveAndMerge(xType[0], ctx, refs)
    }
    return xType.map(type => resolveAndMerge(type, ctx, refs)).flat()
  }

  // Handle object types
  if (isObject(xType)) {
    let obj = {}
    for (const key in xType) {
      obj[key] = resolveAndMerge(xType[key], ctx, refs)
    }
    return obj
  }

  return xType
}

module.exports = {
  resolveAndMerge,
}
