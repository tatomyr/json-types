// Experimental feature

import {isPlainObject, isEmptyObject} from '@redocly/openapi-core/lib/utils.js'

export function translateJSONSchemaToXType(schema, ctx) {
  // Handle writeOnly/readOnly
  const {writeOnly, readOnly, ...newSchema} = schema
  if (writeOnly === true) {
    return {$writeonly: translateJSONSchemaToXType(newSchema, ctx)}
  }
  if (readOnly === true) {
    return {$readonly: translateJSONSchemaToXType(newSchema, ctx)}
  }

  if (
    schema.type === 'string' ||
    schema.type === 'number' ||
    schema.type === 'integer' ||
    schema.type === 'boolean'
  ) {
    if (schema.enum) {
      if (schema.enum.length === 1) {
        return schema.enum[0]
      }
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
    } else if (schema.$ref.startsWith('#/components/x-types/')) {
      return schema
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
    const $and = schema.allOf.map(option =>
      translateJSONSchemaToXType(option, ctx)
    )
    if ($and.length === 1) {
      return $and[0] // handle singe AND
    }
    return {$and}
  }

  if (schema.oneOf) {
    const oneOfs = schema.oneOf.map(option =>
      translateJSONSchemaToXType(option, ctx)
    )
    if (oneOfs.length === 1) return oneOfs[0] // handle single OR
    return oneOfs
  }

  if (schema.anyOf) {
    const anyOfs = schema.anyOf.map(option =>
      translateJSONSchemaToXType(option, ctx)
    )
    if (anyOfs.length === 1) return anyOfs[0] // handle single OR
    return anyOfs
  }

  if (typeof schema === 'function') {
    return undefined
  }

  if (isPlainObject(schema)) {
    console.warn('WARNING! Unable to determine the exact type:', schema)
    return 'any'
  }

  throw new Error(`Cannot translate schema: ${JSON.stringify(schema)}`)
}

function extractObjectLikeNode(schema, ctx) {
  const properties = {}
  const $descriptions = {}
  for (const [name, property] of Object.entries(schema.properties || {})) {
    let realName = name
    if (
      name.includes('string', 'array' /* TODO: add more */) ||
      name.startsWith('$') ||
      !isNaN(name)
    ) {
      realName = '$literal:' + name
    }
    if (Array.isArray(schema.required) && !schema.required.includes(name)) {
      // Handle known non-required properties
      properties[realName] = [
        translateJSONSchemaToXType(property, ctx),
        'undefined',
      ]
    } else {
      properties[realName] = translateJSONSchemaToXType(property, ctx)
    }
    if (property.description) {
      $descriptions[realName] = property.description
    }
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

  // Add the discriminator as it is
  if (isPlainObject(schema.discriminator)) {
    properties['$discriminator'] = schema.discriminator
  }

  if (!isEmptyObject($descriptions)) {
    properties.$descriptions = $descriptions
  }
  if (!isEmptyObject(properties)) {
    return properties
  }
  if (items) {
    return {array: items}
  }

  throw new Error('Invalid object-like schema')
}
