import {cleanupSchema, isObject} from './x-types-utils.js'
import {translateXTypeToSchema} from './x-types-adapter.js'
import {resolveAndMerge, transformInlineRefs} from './x-types-resolver.js'
import {translateJSONSchemaToXType} from './json-schema-adapter.js'

export const generateSchemas = opts => {
  return {
    RequestBody: {
      // Same as in the Response but different _mode.
      MediaType: {
        leave(mediaType, ctx) {
          const original = mediaType['x-type']
          if (typeof original === 'undefined') {
            return
          }
          const resolvedXType = resolveAndMerge(original, {
            ...ctx,
            _circularRefsMaxDepth: opts?.depth,
            _mode: 'request',
          })
          const schema = cleanupSchema(translateXTypeToSchema(resolvedXType))
          mediaType.schema = schema
        },
      },
    },
    Response: {
      // Same as in the RequestBody but different _mode.
      MediaType: {
        leave(mediaType, ctx) {
          const original = mediaType['x-type']
          if (typeof original === 'undefined') {
            return
          }
          const resolvedXType = resolveAndMerge(original, {
            ...ctx,
            _circularRefsMaxDepth: opts?.depth,
            _mode: 'response',
          })
          const schema = cleanupSchema(translateXTypeToSchema(resolvedXType))
          mediaType.schema = schema
        },
      },
    },
    Parameter: {
      leave(parameter, ctx) {
        const original = parameter['x-type']
        if (typeof original === 'undefined') {
          return
        }
        const resolvedXType = resolveAndMerge(original, {
          ...ctx,
          _circularRefsMaxDepth: opts?.depth,
          _mode: 'request',
        })
        const schema = cleanupSchema(translateXTypeToSchema(resolvedXType))
        parameter.schema = schema
      },
    },
  }
}

// TODO: WIP
export const generateNamedXTypes = opts => {
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
  return {
    MediaType: {
      leave(mediaType, ctx) {
        const original = mediaType.schema
        if (typeof original === 'undefined') {
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
        if (typeof original === 'undefined') {
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
            node[key] = transformInlineRefs(node[key])
          }
        }
      },
    },
  }
}
