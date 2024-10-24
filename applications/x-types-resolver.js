import {isObject, mergeAll} from './x-types-utils.js'

export const resolveAndMerge = (xType, ctx, parents = []) => {
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
    const resolved = ctx.resolve(xType, ctx._from)
    if (resolved.node === undefined) {
      console.error('ERROR! Cannot resolve $ref:')
      console.error(xType.$ref)
      return 'any'
    }
    ctx._from = resolved.location.source.absoluteRef // this is needed for resolving $refs outside the main document
    return resolveAndMerge(resolved.node, ctx, [...parents, xType])
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

  // Handle $writeonly and $readonly types
  if (xType.$writeonly !== undefined || xType.$readonly !== undefined) {
    if (ctx._mode === 'request') {
      if (xType.$writeonly === undefined) return 'undefined'
      return resolveAndMerge(xType.$writeonly, ctx, parents)
    }
    if (ctx._mode === 'response') {
      if (xType.$readonly === undefined) return 'undefined'
      return resolveAndMerge(xType.$readonly, ctx, parents)
    }
    return 'undefined'
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
