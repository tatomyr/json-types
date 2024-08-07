const {isObject, isEmptyObject} = require('./x-types-utils')

const SUFFIXES = {
  string: [
    [/^date-time$/, () => ({format: 'date-time'})],
    [/^date$/, () => ({format: 'date'})],
    [/^email$/, () => ({format: 'email'})],
    [/^uuid$/, () => ({format: 'uuid'})],
    [/^binary$/, () => ({format: 'binary'})],
    [/^password$/, () => ({format: 'password'})],
    [/^uri$/, () => ({format: 'uri'})],
    [/^url$/, () => ({format: 'url'})],
    [/^uuid$/, () => ({format: 'uuid'})],

    [/^pattern\((?<value>.+)\)$/, match => ({pattern: match?.groups?.value})],
    [
      /^min\((?<value>[0-9]+)\)$/,
      match => ({minLength: +match?.groups?.value}),
    ],
    [
      /^max\((?<value>[0-9]+)\)$/,
      match => ({maxLength: +match?.groups?.value}),
    ],
  ],
}

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
  if (typeof xType === 'string' && xType.startsWith('string::')) {
    const suffixes = xType.slice('string::'.length).split('::')
    const modifiers = {}
    for (const suffix of suffixes) {
      for (const [re, toJSONSchema] of SUFFIXES.string) {
        const match = re.exec(suffix)
        if (match) {
          Object.assign(modifiers, toJSONSchema(match))
        }
      }
    }
    if (!isEmptyObject(modifiers)) {
      return {type: 'string', ...modifiers}
    }

    throw new Error(`Unsupported string format: ${xType}.`)
  }

  if (xType === 'number') {
    return {type: 'number'}
  }
  if (xType === 'number::integer') {
    return {type: 'integer'}
  }
  // TODO: handle number modifiers

  if (xType === 'boolean') {
    return {type: 'boolean'}
  }

  if (xType === 'any') {
    return {
      // FIXME: delete the below and return simply and empty object
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

  // Handle array types
  if (typeof xType.array !== 'undefined') {
    // TODO: handle array modifiers
    return {type: 'array', items: translateXTypeToSchema(xType.array)}
  }

  // Handle $literal types
  if (typeof xType === 'string' && xType.startsWith('$literal:')) {
    return {type: 'string', enum: [xType.slice('$literal:'.length)]}
  }

  // Handle primitive literals
  if (
    (typeof xType === 'string') |
    (typeof xType === 'number') |
    (typeof xType === 'boolean')
  ) {
    return {type: typeof xType, enum: [xType]}
  }

  // Handle OR types
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

  // Handle object types
  if (isObject(xType)) {
    let properties = {}
    let patternProperties = {}
    let required = []
    const {string, $descriptions, $schema, ...props} = xType
    if ($schema) {
      return $schema
    }

    const additionalProperties =
      typeof string === 'undefined' ? false : translateXTypeToSchema(string)

    for (const key in props) {
      if (key.startsWith('string::pattern(') && key.endsWith(')')) {
        // Handle patternProperties
        const pattern = key.slice('string::pattern('.length, -1)
        patternProperties[pattern] = translateXTypeToSchema(props[key])
      } else {
        // Handle regular properties
        const realKey = key.startsWith('$literal:')
          ? key.slice('$literal:'.length)
          : key
        properties[realKey] = translateXTypeToSchema(props[key])
        if (Array.isArray(props[key]) && props[key].includes('undefined')) {
          // skip
        } else {
          required.push(realKey)
        }
      }
    }

    // All fields at this level could have descriptions defined inside the $descriptions field.
    for (const describedPropertyKey in $descriptions) {
      properties[describedPropertyKey].description =
        $descriptions[describedPropertyKey]
    }

    return {
      type: 'object',
      properties,
      required,
      additionalProperties,
      patternProperties,
    }
  }

  throw new Error('Cannot process x-type:', xType)
}

module.exports = {
  translateXTypeToSchema,
}
