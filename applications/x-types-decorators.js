const {isObject} = require('./x-types-utils')
const {translateXTypeToSchema} = require('./x-types-adapter')
const {resolveAndMerge} = require('./x-types-resolver')
const {translateJSONSchemaToXType} = require('./json-schema-adapter')

const generateSchemas = opts => {
  const preserveExistingSchemas = !!opts?.preserveExistingSchemas
  return {
    MediaType: {
      leave(mediaType, ctx) {
        const original = mediaType['x-type']
        if (
          typeof original === 'undefined' ||
          (preserveExistingSchemas && mediaType.schema)
        ) {
          return
        }
        const resolvedXType = resolveAndMerge(original, ctx)
        const schema = translateXTypeToSchema(resolvedXType)
        mediaType.schema = schema
      },
    },
    Parameter: {
      leave(parameter, ctx) {
        const original = parameter['x-type']
        if (
          typeof original === 'undefined' ||
          (preserveExistingSchemas && parameter.schema)
        ) {
          return
        }
        const resolvedXType = resolveAndMerge(original, ctx)
        const schema = translateXTypeToSchema(resolvedXType)
        parameter.schema = schema
      },
    },
  }
}

// Experimental
const generateNamedXTypes = opts => {
  const preserveExistingXTypes = !!opts?.preserveExistingXTypes
  const namedXTypes = {}
  return {
    Components: {
      leave(components, ctx) {
        components['x-types'] = namedXTypes
      },
      NamedSchemas: {
        Schema: {
          enter(schema, ctx) {
            namedXTypes[ctx.key] = translateJSONSchemaToXType(schema, ctx)
          },
        },
      },
    },
  }
}

// Experimental
const generateXTypes = opts => {
  const preserveExistingXTypes = !!opts?.preserveExistingXTypes
  return {
    MediaType: {
      leave(mediaType, ctx) {
        const original = mediaType.schema
        if (
          typeof original === 'undefined' ||
          (preserveExistingXTypes && mediaType['x-type'])
        ) {
          return
        }
        const xType = translateJSONSchemaToXType(original, ctx)
        mediaType['x-type'] = xType
        delete mediaType.schema
      },
    },
    Parameter: {
      leave(parameter, ctx) {
        const original = parameter.schema
        if (
          typeof original === 'undefined' ||
          (preserveExistingXTypes && parameter['x-type'])
        ) {
          return
        }
        const xType = translateJSONSchemaToXType(original, ctx)
        parameter['x-type'] = xType
        delete parameter.schema
      },
    },
  }
}

const createRefs = () => {
  return {
    any: {
      enter: (node, ctx) => {
        if (isObject(node) || Array.isArray(node)) {
          for (const key in node) {
            const value = node[key]
            if (typeof value === 'string' && value.startsWith('$ref:')) {
              const $ref = value.slice('$ref:'.length)
              node[key] = {$ref}
            }
          }
        }
      },
    },
  }
}

module.exports = {
  generateSchemas,
  generateXTypes,
  generateNamedXTypes,
  createRefs,
}
