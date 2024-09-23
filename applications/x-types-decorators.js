import {isObject} from './x-types-utils.js'
import {translateXTypeToSchema} from './x-types-adapter.js'
import {resolveAndMerge} from './x-types-resolver.js'
import {translateJSONSchemaToXType} from './json-schema-adapter.js'

export const generateSchemas = opts => {
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
        const resolvedXType = resolveAndMerge(original, {
          ...ctx,
          _circularRefsMaxDepth: opts?.depth,
        })
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
        const resolvedXType = resolveAndMerge(original, {
          ...ctx,
          _circularRefsMaxDepth: opts?.depth,
        })
        const schema = translateXTypeToSchema(resolvedXType)
        parameter.schema = schema
      },
    },
  }
}

// TODO: WIP
export const generateNamedXTypes = opts => {
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

// TODO: WIP
export const generateXTypes = opts => {
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

export const createRefs = () => {
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
