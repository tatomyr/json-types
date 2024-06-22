// Experimental feature

const {
  isPlainObject,
  isEmptyObject,
} = require('@redocly/openapi-core/lib/utils')

function translateJSONSchemaToXType(schema, ctx) {
  if (
    schema.type === 'string' ||
    schema.type === 'number' ||
    schema.type === 'integer' ||
    schema.type === 'boolean'
  ) {
    if (schema.enum) {
      return schema.enum
    }

    let t = schema.type
    if (schema.type === 'integer') {
      t = 'number::integer'
    }
    if (
      schema.format &&
      schema.type !== 'number' &&
      schema.type !== 'integer'
    ) {
      t += `::${schema.format}`
    }
    if (schema.pattern) {
      t += `::pattern(${schema.pattern})`
    }
    if (schema.minimum || schema.minLength) {
      t += `::min(${schema.minimum || schema.minLength})`
    }
    if (schema.maximum || schema.maxLength) {
      t += `::max(${schema.maximum || schema.maxLength})`
    }

    return t
  }

  if (schema.type === 'object' && !schema.properties && !schema.oneOf) {
    if (
      schema.additionalProperties === undefined ||
      schema.additionalProperties === true
    ) {
      return {string: 'any'}
    } else if (schema.additionalProperties === false) {
      return {string: 'undefined'}
    }
  }

  if (schema.$ref) {
    if (schema.$ref.startsWith('#/components/schemas/')) {
      return {
        $ref: schema.$ref.replace(
          '#/components/schemas/',
          '#/components/x-types/'
        ),
      }
    }

    const resolved = ctx.resolve(schema).node
    if (resolved === undefined) {
      console.error('ERROR! Cannot resolve $ref:')
      console.error(schema.$ref)
      return schema
    }
    return translateJSONSchemaToXType(resolved, ctx)
  }

  if (
    isPlainObject(schema.properties) ||
    isPlainObject(schema.additionalProperties) ||
    isPlainObject(schema.items)
  ) {
    return extractObjectLikeNode(schema)
  }

  if (schema.allOf) {
    return {
      $and: schema.allOf.map((option, i) =>
        translateJSONSchemaToXType(option, ctx)
      ),
    }
  }

  if (schema.oneOf) {
    const oneOfs = schema.oneOf.map((option, i) =>
      translateJSONSchemaToXType(option, ctx)
    )
    if (schema.discriminator) {
      return {
        $discriminator: schema.discriminator,
        $xor: oneOfs,
      }
    } else {
      return oneOfs
    }
  }

  if (schema.anyOf) {
    return schema.anyOf.map((option, i) =>
      translateJSONSchemaToXType(option, ctx)
    )
  }

  if (typeof schema === 'function') {
    return undefined
  }

  return {$schema: schema}
}

function extractObjectLikeNode(schema, ctx) {
  const properties = {}
  for (const [name, property] of Object.entries(schema.properties || {})) {
    let realName = name
    if (
      name.includes('string', 'array' /* TODO: add more */) ||
      name.startsWith('$') ||
      !isNaN(name)
    ) {
      realName = '$literal:' + name
    }
    properties[realName] = translateJSONSchemaToXType(property, ctx)
  }

  if (isPlainObject(schema.additionalProperties)) {
    properties['string'] = translateJSONSchemaToXType(
      schema.additionalProperties,
      ctx
    )
  }

  let items
  if (isPlainObject(schema.items)) {
    items = translateJSONSchemaToXType(schema.items, ctx)
  }

  if (!isEmptyObject(properties)) return properties
  if (items) return {array: items}

  throw new Error('Invalid object-like schema')
}

module.exports = {translateJSONSchemaToXType}
