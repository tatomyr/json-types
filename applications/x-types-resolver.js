const {isObject, mergeAll} = require('./x-types-utils')

const resolveAndMerge = (xType, ctx, parents = []) => {
  const maxDepth = ctx._circularRefsMaxDepth ?? 3

  // Handle null types
  if (xType === null) {
    return null
  }

  // Handle $refs
  if (xType.$ref) {
    if (parents.filter(p => p?.$ref === xType.$ref).length >= maxDepth) {
      console.warn('WARNING! Circular reference detected:', xType.$ref)
      // Returning `any` to avoid circular references:
      return 'any'
    }
    const resolved = ctx.resolve(xType).node
    if (resolved === undefined) {
      console.error('ERROR! Cannot resolve $ref:')
      console.error(xType.$ref)
      return 'any'
    }
    return resolveAndMerge(resolved, ctx, [...parents, xType])
  }

  // Handle AND types
  if (xType.$and) {
    if (!Array.isArray(xType.$and)) {
      console.error('ERROR! Expected an array but got:')
      console.error(xType.$and)
      return 'undefined'
    }
    return mergeAll(
      ...xType.$and.map(item => resolveAndMerge(item, ctx, [...parents, xType]))
    )
  }

  // Handle OR types
  if (Array.isArray(xType)) {
    if (xType.length === 0) {
      return 'undefined'
    }
    if (xType.length === 1) {
      return resolveAndMerge(xType[0], ctx, [...parents, xType])
    }
    return xType
      .map(type => resolveAndMerge(type, ctx, [...parents, xType]))
      .flat()
  }

  // Handle object types
  if (isObject(xType)) {
    let obj = {}
    for (const key in xType) {
      obj[key] = resolveAndMerge(xType[key], ctx, [...parents, xType])
    }
    return obj
  }

  return xType
}

module.exports = {
  resolveAndMerge,
}
