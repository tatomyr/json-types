const {isObject} = require('./x-types-utils')

const translateXTypeToSchema = xType => {
  if (typeof xType === 'undefined') {
    throw new Error('Expected "x-type" but got "undefined"')
  }

  if (xType === null) {
    return {type: 'null'}
  }

  if (xType === 'string') {
    return {type: 'string'}
  }
  if (xType === 'string::date') {
    return {type: 'string', format: 'date'}
  }
  if (xType === 'string::date-time') {
    return {type: 'string', format: 'date-time'}
  }
  if (xType === 'string::email') {
    return {type: 'string', format: 'email'}
  }
  if (xType === 'string::uuid') {
    return {type: 'string', format: 'uuid'}
  }
  if (xType === 'string::binary') {
    return {type: 'string', format: 'binary'}
  }

  if (xType === 'number') {
    return {type: 'number'}
  }
  if (xType === 'number::integer') {
    return {type: 'integer'}
  }

  if (xType === 'boolean') {
    return {type: 'boolean'}
  }

  if (xType === 'any') {
    return {
      anyOf: [
        {type: 'string'},
        {type: 'number'},
        {type: 'boolean'},
        {type: 'object'},
        {type: 'array'},
        {type: 'null'},
      ],
    }
  }

  if (xType === 'undefined') {
    console.warn("WARNING! Got an 'undefined' type.")
    return {not: {}}
  }

  if (typeof xType.array !== 'undefined') {
    return {type: 'array', items: translateXTypeToSchema(xType.array)}
  }

  if (typeof xType === 'string' && xType.startsWith('$literal:')) {
    return {type: 'string', enum: [xType.slice('$literal:'.length)]}
  }

  if (
    (typeof xType === 'string') |
    (typeof xType === 'number') |
    (typeof xType === 'boolean')
  ) {
    return {type: typeof xType, enum: [xType]}
  }

  if (Array.isArray(xType)) {
    const normalized = xType
      .filter(type => type !== 'undefined')
      .map(type => translateXTypeToSchema(type))
    if (normalized.length === 0) {
      return {not: {}}
    }
    if (normalized.length === 1) {
      return normalized[0]
    }
    // Triage the normalized array into string and other
    const normalizedStringEnums = normalized.filter(
      schema => schema.type === 'string' && schema.enum
    )
    const normalizedString =
      normalizedStringEnums.length > 0
        ? {
            type: 'string',
            enum: normalizedStringEnums.map(schema => schema.enum).flat(),
          }
        : undefined
    const normalizedOthers = normalized.filter(
      schema => schema.type !== 'string'
    )
    if (normalizedOthers.length === 0) {
      return normalizedString
    }
    if (!normalizedString) {
      return {anyOf: normalized}
    }
    return {
      anyOf: [normalizedString, ...normalizedOthers],
    }
  }

  if (isObject(xType)) {
    let properties = {}
    let required = []
    const {string, $descriptions, $schema, ...props} = xType
    if ($schema) {
      return $schema
    }

    const additionalProperties =
      typeof string === 'undefined' ? false : translateXTypeToSchema(string)

    for (const key in props) {
      const realKey = key.startsWith('$literal:')
        ? key.slice('$literal:'.length)
        : key

      properties[realKey] = translateXTypeToSchema(props[key])

      if (props[key] instanceof Array && props[key].includes('undefined')) {
        // skip
      } else {
        required.push(realKey)
      }
    }

    // All fields at this level could have descriptions defined inside the $description field.
    for (const describedPropertyKey in $descriptions) {
      properties[describedPropertyKey].description =
        $descriptions[describedPropertyKey]
    }

    return {type: 'object', properties, required, additionalProperties}
  }

  throw new Error('Cannot process x-type:', xType)
}

module.exports = {
  translateXTypeToSchema,
}
